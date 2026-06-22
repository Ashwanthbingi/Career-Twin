package com.twinos.career.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinos.career.dto.CodingTimelineDto;
import com.twinos.career.dto.InterviewReadinessDto;
import com.twinos.career.dto.LeetCodeAnalysisRequest;
import com.twinos.career.dto.LeetCodeIntelligenceResponse;
import com.twinos.career.dto.LeetCodeTopicScoreDto;
import com.twinos.career.entity.LeetCodeProfile;
import com.twinos.career.entity.Skill;
import com.twinos.career.entity.SkillEvidenceSource;
import com.twinos.career.entity.User;
import com.twinos.career.entity.UserSkill;
import com.twinos.career.exception.ResourceNotFoundException;
import com.twinos.career.repository.LeetCodeProfileRepository;
import com.twinos.career.repository.SkillRepository;
import com.twinos.career.repository.UserRepository;
import com.twinos.career.repository.UserSkillRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LeetCodeAnalyzerService {

    private static final String LEETCODE_SOURCE = "leetcode";
    private static final List<String> TOPICS = List.of(
            "Arrays", "Strings", "Trees", "Graphs", "Dynamic Programming",
            "Greedy", "Backtracking", "Heap", "Binary Search"
    );

    private final UserRepository userRepository;
    private final LeetCodeProfileRepository leetCodeProfileRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillValidationService skillValidationService;
    private final ObjectMapper objectMapper;
    private final RestClient leetCodeClient;

    public LeetCodeAnalyzerService(
            UserRepository userRepository,
            LeetCodeProfileRepository leetCodeProfileRepository,
            SkillRepository skillRepository,
            UserSkillRepository userSkillRepository,
            SkillValidationService skillValidationService,
            ObjectMapper objectMapper,
            RestClient.Builder restClientBuilder
    ) {
        this.userRepository = userRepository;
        this.leetCodeProfileRepository = leetCodeProfileRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.skillValidationService = skillValidationService;
        this.objectMapper = objectMapper;
        this.leetCodeClient = restClientBuilder
                .baseUrl("https://leetcode.com")
                .defaultHeader("Referer", "https://leetcode.com")
                .defaultHeader("User-Agent", "Twinos-LeetCode-Intelligence")
                .build();
    }

    @Transactional
    public LeetCodeIntelligenceResponse analyze(LeetCodeAnalysisRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userId()));

        String username = request.username().trim();
        LeetCodeRawProfile raw = fetchLeetCodeProfile(username);
        List<LeetCodeTopicScoreDto> topics = buildTopicScores(raw);
        int problemSolvingScore = calculateProblemSolvingScore(raw, topics);
        InterviewReadinessDto readiness = interviewReadiness(raw, problemSolvingScore);
        List<String> strengths = topics.stream()
                .sorted(Comparator.comparingInt(LeetCodeTopicScoreDto::score).reversed())
                .limit(3)
                .map(LeetCodeTopicScoreDto::topic)
                .toList();
        List<String> weaknesses = topics.stream()
                .sorted(Comparator.comparingInt(LeetCodeTopicScoreDto::score))
                .limit(3)
                .map(LeetCodeTopicScoreDto::topic)
                .toList();
        List<CodingTimelineDto> timeline = buildTimeline(raw, problemSolvingScore);

        LeetCodeProfile profile = leetCodeProfileRepository.findByUserId(user.getId())
                .orElseGet(LeetCodeProfile::new);
        profile.setUser(user);
        profile.setUsername(username);
        profile.setTotalSolved(raw.totalSolved());
        profile.setEasySolved(raw.easySolved());
        profile.setMediumSolved(raw.mediumSolved());
        profile.setHardSolved(raw.hardSolved());
        profile.setContestRating(raw.contestRating());
        profile.setRanking(raw.ranking());
        profile.setProblemSolvingScore(problemSolvingScore);
        profile.setServiceReadiness(readiness.serviceCompanies());
        profile.setProductReadiness(readiness.productCompanies());
        profile.setFaangReadiness(readiness.faangLevel());
        profile.setTopicScoresJson(writeJson(topics));
        profile.setStrengthsJson(writeJson(strengths));
        profile.setWeaknessesJson(writeJson(weaknesses));
        profile.setTimelineJson(writeJson(timeline));

        LeetCodeProfile saved = leetCodeProfileRepository.save(profile);
        linkLeetCodeSkills(user, strengths, topics);
        recordInterviewEvidence(user.getId(), readiness);
        return toResponse(saved);
    }

    public LeetCodeIntelligenceResponse getProfile(Long userId) {
        return toResponse(profile(userId));
    }

    public LeetCodeIntelligenceResponse getIntelligence(Long userId) {
        return toResponse(profile(userId));
    }

    private LeetCodeProfile profile(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }
        return leetCodeProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("LeetCode profile not found for user: " + userId));
    }

    private LeetCodeRawProfile fetchLeetCodeProfile(String username) {
        String query = """
                query userProfile($username: String!) {
                  matchedUser(username: $username) {
                    profile { ranking }
                    submitStatsGlobal {
                      acSubmissionNum { difficulty count }
                    }
                    tagProblemCounts {
                      advanced { tagName problemsSolved }
                      intermediate { tagName problemsSolved }
                      fundamental { tagName problemsSolved }
                    }
                  }
                  userContestRanking(username: $username) {
                    rating
                  }
                }
                """;

        try {
            Map<String, Object> body = Map.of(
                    "query", query,
                    "variables", Map.of("username", username)
            );
            Map<String, Object> response = leetCodeClient.post()
                    .uri("/graphql")
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });
            return parseRawProfile(username, response);
        } catch (RestClientResponseException ex) {
            throw new IllegalArgumentException("LeetCode analysis failed: " + ex.getStatusText());
        }
    }

    @SuppressWarnings("unchecked")
    private LeetCodeRawProfile parseRawProfile(String username, Map<String, Object> response) {
        Map<String, Object> data = response == null ? null : (Map<String, Object>) response.get("data");
        Map<String, Object> matchedUser = data == null ? null : (Map<String, Object>) data.get("matchedUser");
        if (matchedUser == null) {
            throw new ResourceNotFoundException("LeetCode user not found: " + username);
        }

        Map<String, Object> submitStats = (Map<String, Object>) matchedUser.get("submitStatsGlobal");
        List<Map<String, Object>> submissions = (List<Map<String, Object>>) submitStats.get("acSubmissionNum");
        int total = countFor(submissions, "All");
        int easy = countFor(submissions, "Easy");
        int medium = countFor(submissions, "Medium");
        int hard = countFor(submissions, "Hard");

        Map<String, Object> profile = (Map<String, Object>) matchedUser.get("profile");
        int ranking = intValue(profile.get("ranking"));
        Map<String, Object> contest = data == null ? null : (Map<String, Object>) data.get("userContestRanking");
        int rating = contest == null ? 0 : (int) Math.round(doubleValue(contest.get("rating")));

        Map<String, Integer> tagCounts = new LinkedHashMap<>();
        Map<String, Object> tagProblemCounts = (Map<String, Object>) matchedUser.get("tagProblemCounts");
        if (tagProblemCounts != null) {
            for (Object group : tagProblemCounts.values()) {
                for (Map<String, Object> tag : (List<Map<String, Object>>) group) {
                    tagCounts.put(normalizeTopic(String.valueOf(tag.get("tagName"))), intValue(tag.get("problemsSolved")));
                }
            }
        }

        return new LeetCodeRawProfile(total, easy, medium, hard, rating, ranking, tagCounts);
    }

    private List<LeetCodeTopicScoreDto> buildTopicScores(LeetCodeRawProfile raw) {
        return TOPICS.stream()
                .map(topic -> {
                    int solved = raw.topicCounts().getOrDefault(normalizeTopic(topic), 0);
                    int score = Math.min(100, (solved * 8) + Math.min(20, raw.mediumSolved() / 5) + Math.min(15, raw.hardSolved() * 2));
                    return new LeetCodeTopicScoreDto(topic, score, solved);
                })
                .toList();
    }

    private int calculateProblemSolvingScore(LeetCodeRawProfile raw, List<LeetCodeTopicScoreDto> topics) {
        int volume = Math.min(35, raw.totalSolved() / 5);
        int difficulty = Math.min(35, (raw.mediumSolved() / 3) + (raw.hardSolved() * 2));
        int breadth = (int) Math.round(topics.stream().mapToInt(LeetCodeTopicScoreDto::score).average().orElse(0) * 0.2);
        int contest = raw.contestRating() <= 0 ? 0 : Math.min(10, Math.max(0, (raw.contestRating() - 1400) / 80));
        return Math.min(100, volume + difficulty + breadth + contest);
    }

    private InterviewReadinessDto interviewReadiness(LeetCodeRawProfile raw, int score) {
        int service = Math.min(100, score + Math.min(20, raw.easySolved() / 4));
        int product = Math.min(100, score + Math.min(15, raw.mediumSolved() / 5) - 5);
        int faang = Math.min(100, score + Math.min(20, raw.hardSolved() * 2) - 18);
        return new InterviewReadinessDto(Math.max(0, service), Math.max(0, product), Math.max(0, faang));
    }

    private List<CodingTimelineDto> buildTimeline(LeetCodeRawProfile raw, int score) {
        return List.of(
                new CodingTimelineDto("Foundation", Math.min(100, raw.easySolved())),
                new CodingTimelineDto("Pattern Depth", Math.min(100, raw.mediumSolved() * 2)),
                new CodingTimelineDto("Hard Problems", Math.min(100, raw.hardSolved() * 8)),
                new CodingTimelineDto("Interview Ready", score)
        );
    }

    private void linkLeetCodeSkills(User user, List<String> strengths, List<LeetCodeTopicScoreDto> topics) {
        Map<String, Integer> topicScores = topics.stream()
                .collect(Collectors.toMap(LeetCodeTopicScoreDto::topic, LeetCodeTopicScoreDto::score));

        for (String skillName : strengths) {
            int topicScore = topicScores.getOrDefault(skillName, 0);
            Skill skill = skillRepository.findByNameIgnoreCase(skillName)
                    .orElseGet(() -> {
                        Skill created = new Skill();
                        created.setName(skillName);
                        created.setCategory("Algorithms");
                        created.setKeywords(skillName.toLowerCase(Locale.ROOT));
                        return skillRepository.save(created);
                    });
            Optional<UserSkill> existing = userSkillRepository.findByUserIdAndSkillId(user.getId(), skill.getId());
            if (existing.isPresent()) {
                UserSkill userSkill = existing.get();
                if (!List.of(userSkill.getSource().split(",")).stream().anyMatch(LEETCODE_SOURCE::equalsIgnoreCase)) {
                    userSkill.setSource(userSkill.getSource() + "," + LEETCODE_SOURCE);
                    userSkillRepository.save(userSkill);
                }
            } else {
                UserSkill userSkill = new UserSkill();
                userSkill.setUser(user);
                userSkill.setSkill(skill);
                userSkill.setSource(LEETCODE_SOURCE);
                userSkillRepository.save(userSkill);
            }
            recordTopicEvidence(user.getId(), skillName, topicScore);
        }
    }

    private void recordTopicEvidence(Long userId, String skillName, int topicScore) {
        skillValidationService.upsertValidation(
                userId,
                skillName,
                SkillEvidenceSource.LEETCODE,
                "LeetCode topic score " + topicScore + "/100 from solved problem patterns.",
                Math.min(25, Math.max(10, topicScore / 4))
        );
    }

    private void recordInterviewEvidence(Long userId, InterviewReadinessDto readiness) {
        skillValidationService.upsertValidation(
                userId,
                "Interview Readiness",
                SkillEvidenceSource.LEETCODE,
                "Service " + readiness.serviceCompanies() + "%, Product " + readiness.productCompanies()
                        + "%, FAANG-level " + readiness.faangLevel() + "% from LeetCode intelligence.",
                Math.min(25, readiness.productCompanies() / 4)
        );
    }

    private LeetCodeIntelligenceResponse toResponse(LeetCodeProfile profile) {
        return new LeetCodeIntelligenceResponse(
                profile.getUser().getId(),
                profile.getUsername(),
                profile.getTotalSolved(),
                profile.getEasySolved(),
                profile.getMediumSolved(),
                profile.getHardSolved(),
                profile.getContestRating(),
                profile.getRanking(),
                profile.getProblemSolvingScore(),
                new InterviewReadinessDto(profile.getServiceReadiness(), profile.getProductReadiness(), profile.getFaangReadiness()),
                readList(profile.getTopicScoresJson(), LeetCodeTopicScoreDto.class),
                readList(profile.getStrengthsJson(), String.class),
                readList(profile.getWeaknessesJson(), String.class),
                readList(profile.getTimelineJson(), CodingTimelineDto.class),
                DateTimeFormatter.ISO_INSTANT.format(profile.getUpdatedAt())
        );
    }

    private int countFor(List<Map<String, Object>> submissions, String difficulty) {
        return submissions.stream()
                .filter(row -> difficulty.equals(row.get("difficulty")))
                .findFirst()
                .map(row -> intValue(row.get("count")))
                .orElse(0);
    }

    private String normalizeTopic(String topic) {
        return topic.toLowerCase(Locale.ROOT).replaceAll("[^a-z0-9]", "");
    }

    private int intValue(Object value) {
        return value instanceof Number number ? number.intValue() : 0;
    }

    private double doubleValue(Object value) {
        return value instanceof Number number ? number.doubleValue() : 0;
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize LeetCode intelligence", ex);
        }
    }

    private <T> List<T> readList(String json, Class<T> type) {
        try {
            return objectMapper.readValue(json, objectMapper.getTypeFactory().constructCollectionType(List.class, type));
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to deserialize LeetCode intelligence", ex);
        }
    }

    private record LeetCodeRawProfile(
            int totalSolved,
            int easySolved,
            int mediumSolved,
            int hardSolved,
            int contestRating,
            int ranking,
            Map<String, Integer> topicCounts
    ) {
    }
}
