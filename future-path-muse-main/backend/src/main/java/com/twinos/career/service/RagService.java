package com.twinos.career.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinos.career.dto.rag.*;
import com.twinos.career.entity.*;
import com.twinos.career.exception.ResourceNotFoundException;
import com.twinos.career.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.time.Duration;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RagService {

    private static final Logger log = LoggerFactory.getLogger(RagService.class);

    private final WebClient ragWebClient;
    private final ObjectMapper objectMapper;
    
    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final ResumeRepository resumeRepository;
    private final GitHubProfileRepository gitHubProfileRepository;
    private final LeetCodeProfileRepository leetCodeProfileRepository;
    private final RagAnalysisCacheRepository cacheRepository;
    private final JobRoleRepository jobRoleRepository;

    public RagService(
            WebClient ragWebClient,
            ObjectMapper objectMapper,
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            ResumeRepository resumeRepository,
            GitHubProfileRepository gitHubProfileRepository,
            LeetCodeProfileRepository leetCodeProfileRepository,
            RagAnalysisCacheRepository cacheRepository,
            JobRoleRepository jobRoleRepository
    ) {
        this.ragWebClient = ragWebClient;
        this.objectMapper = objectMapper;
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.resumeRepository = resumeRepository;
        this.gitHubProfileRepository = gitHubProfileRepository;
        this.leetCodeProfileRepository = leetCodeProfileRepository;
        this.cacheRepository = cacheRepository;
        this.jobRoleRepository = jobRoleRepository;
    }

    @Transactional
    public RagResumeAnalysisResponse analyzeResume(Long userId) {
        // 1. Check cache
        Optional<RagResumeAnalysisResponse> cached = getFromCache(userId, "RESUME", "general", RagResumeAnalysisResponse.class);
        if (cached.isPresent()) {
            log.info("Returning cached Resume RAG analysis for user {}", userId);
            return cached.get();
        }

        // 2. Fetch User & Resume
        User user = ensureUser(userId);
        Resume resume = resumeRepository.findByUserIdAndActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Active resume not found for user: " + userId));

        // 3. Gather skills and goals
        List<String> userSkills = getSkillNames(userId);
        List<String> careerGoals = getCareerGoals(userId);

        // 4. Call FastAPI
        Map<String, Object> requestBody = Map.of(
                "resume_text", resume.getExtractedText(),
                "user_skills", userSkills,
                "career_goals", careerGoals
        );

        log.info("Calling FastAPI RAG service /rag/resume-analysis for user {}", userId);
        RagResumeAnalysisResponse response = ragWebClient.post()
                .uri("/rag/resume-analysis")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(RagResumeAnalysisResponse.class)
                .block();

        // 5. Cache response (Expires in 24 hours)
        if (response != null) {
            saveToCache(userId, "RESUME", "general", response, Duration.ofHours(24));
        }

        return response;
    }

    @Transactional
    public RagGitHubAnalysisResponse analyzeGitHub(Long userId) {
        // 1. Check cache
        Optional<RagGitHubAnalysisResponse> cached = getFromCache(userId, "GITHUB", "general", RagGitHubAnalysisResponse.class);
        if (cached.isPresent()) {
            log.info("Returning cached GitHub RAG analysis for user {}", userId);
            return cached.get();
        }

        // 2. Fetch User & GitHub profile
        User user = ensureUser(userId);
        GitHubProfile profile = gitHubProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("GitHub profile not found for user: " + userId));

        // 3. Prepare payload
        List<String> languages = readJsonStringList(profile.getLanguagesJson());
        List<String> detectedSkills = readJsonStringList(profile.getDetectedSkillsJson());

        // Create simple mock repositories objects using languages to populate RAG search terms
        List<Map<String, Object>> repos = new ArrayList<>();
        for (String lang : languages) {
            repos.add(Map.of(
                    "name", lang.toLowerCase() + "-project",
                    "description", "A portfolio repository demonstrating development in " + lang + ". Built clean architectures and database schemas.",
                    "language", lang,
                    "stars", profile.getStars() > 0 ? profile.getStars() / languages.size() : 0
            ));
        }

        Map<String, Object> requestBody = Map.of(
                "repositories", repos,
                "languages", languages,
                "total_stars", profile.getStars(),
                "contribution_score", profile.getContributionScore()
        );

        // 4. Call FastAPI
        log.info("Calling FastAPI RAG service /rag/github-analysis for user {}", userId);
        RagGitHubAnalysisResponse response = ragWebClient.post()
                .uri("/rag/github-analysis")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(RagGitHubAnalysisResponse.class)
                .block();

        // 5. Cache response (Expires in 24 hours)
        if (response != null) {
            saveToCache(userId, "GITHUB", "general", response, Duration.ofHours(24));
        }

        return response;
    }

    @Transactional
    public RagLeetCodeAnalysisResponse analyzeLeetCode(Long userId) {
        // 1. Check cache
        Optional<RagLeetCodeAnalysisResponse> cached = getFromCache(userId, "LEETCODE", "general", RagLeetCodeAnalysisResponse.class);
        if (cached.isPresent()) {
            log.info("Returning cached LeetCode RAG analysis for user {}", userId);
            return cached.get();
        }

        // 2. Fetch User & LeetCode profile
        User user = ensureUser(userId);
        LeetCodeProfile profile = leetCodeProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("LeetCode profile not found for user: " + userId));

        // 3. Prepare payload
        List<String> strengths = readJsonStringList(profile.getStrengthsJson());
        List<String> weaknesses = readJsonStringList(profile.getWeaknessesJson());

        Map<String, Object> requestBody = Map.of(
                "total_solved", profile.getTotalSolved(),
                "easy_solved", profile.getEasySolved(),
                "medium_solved", profile.getMediumSolved(),
                "hard_solved", profile.getHardSolved(),
                "contest_rating", (double) profile.getContestRating(),
                "ranking", profile.getRanking(),
                "strengths", strengths,
                "weaknesses", weaknesses
        );

        // 4. Call FastAPI
        log.info("Calling FastAPI RAG service /rag/leetcode-analysis for user {}", userId);
        RagLeetCodeAnalysisResponse response = ragWebClient.post()
                .uri("/rag/leetcode-analysis")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(RagLeetCodeAnalysisResponse.class)
                .block();

        // 5. Cache response (Expires in 24 hours)
        if (response != null) {
            saveToCache(userId, "LEETCODE", "general", response, Duration.ofHours(24));
        }

        return response;
    }

    @Transactional
    public RagCareerRecommendationResponse getCareerRecommendations(Long userId) {
        // 1. Check cache
        Optional<RagCareerRecommendationResponse> cached = getFromCache(userId, "CAREER", "general", RagCareerRecommendationResponse.class);
        if (cached.isPresent()) {
            log.info("Returning cached Career RAG recommendations for user {}", userId);
            return cached.get();
        }

        // 2. Fetch user profile elements (allow optional)
        User user = ensureUser(userId);
        
        String resumeText = resumeRepository.findByUserIdAndActiveTrue(userId)
                .map(Resume::getExtractedText)
                .orElse("");
                
        List<String> skills = getSkillNames(userId);
        List<String> careerGoals = getCareerGoals(userId);

        Map<String, Object> githubData = null;
        Optional<GitHubProfile> gitHubProfile = gitHubProfileRepository.findByUserId(userId);
        if (gitHubProfile.isPresent()) {
            GitHubProfile gp = gitHubProfile.get();
            githubData = Map.of(
                    "repositories", gp.getRepositories(),
                    "stars", gp.getStars(),
                    "contribution_score", gp.getContributionScore(),
                    "languages", readJsonStringList(gp.getLanguagesJson())
            );
        }

        Map<String, Object> leetcodeData = null;
        Optional<LeetCodeProfile> leetCodeProfile = leetCodeProfileRepository.findByUserId(userId);
        if (leetCodeProfile.isPresent()) {
            LeetCodeProfile lp = leetCodeProfile.get();
            leetcodeData = Map.of(
                    "total_solved", lp.getTotalSolved(),
                    "problem_solving_score", lp.getProblemSolvingScore(),
                    "strengths", readJsonStringList(lp.getStrengthsJson())
            );
        }

        // 3. Call FastAPI
        Map<String, Object> requestBody = Map.of(
                "resume_text", resumeText,
                "skills", skills,
                "github_data", githubData != null ? githubData : Map.of(),
                "leetcode_data", leetcodeData != null ? leetcodeData : Map.of(),
                "career_goals", careerGoals
        );

        log.info("Calling FastAPI RAG service /rag/career-recommendation for user {}", userId);
        RagCareerRecommendationResponse response = ragWebClient.post()
                .uri("/rag/career-recommendation")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(RagCareerRecommendationResponse.class)
                .block();

        // 4. Cache response (Expires in 24 hours)
        if (response != null) {
            saveToCache(userId, "CAREER", "general", response, Duration.ofHours(24));
        }

        return response;
    }

    @Transactional
    public RagSkillValidationResponse validateSkill(Long userId, String skillName) {
        String cacheKey = "skill:" + skillName;
        // 1. Check cache
        Optional<RagSkillValidationResponse> cached = getFromCache(userId, "SKILL_VALIDATION", cacheKey, RagSkillValidationResponse.class);
        if (cached.isPresent()) {
            log.info("Returning cached Skill Validation RAG for user {} / skill {}", userId, skillName);
            return cached.get();
        }

        // 2. Fetch User
        User user = ensureUser(userId);

        // 3. Assemble evidence
        String resumeEvidence = "";
        Optional<Resume> resumeOpt = resumeRepository.findByUserIdAndActiveTrue(userId);
        if (resumeOpt.isPresent()) {
            String fullText = resumeOpt.get().getExtractedText();
            resumeEvidence = findSentencesContainingKeyword(fullText, skillName);
        }

        String githubEvidence = "";
        Optional<GitHubProfile> ghOpt = gitHubProfileRepository.findByUserId(userId);
        if (ghOpt.isPresent()) {
            List<String> ghSkills = readJsonStringList(ghOpt.get().getDetectedSkillsJson());
            if (ghSkills.stream().anyMatch(s -> s.equalsIgnoreCase(skillName))) {
                githubEvidence = "Skill '" + skillName + "' detected in repositories of user " + ghOpt.get().getGithubUsername() 
                        + " with overall portfolio score of " + ghOpt.get().getContributionScore() + ".";
            }
        }

        String leetcodeEvidence = "";
        Optional<LeetCodeProfile> lcOpt = leetCodeProfileRepository.findByUserId(userId);
        if (lcOpt.isPresent()) {
            List<String> strengths = readJsonStringList(lcOpt.get().getStrengthsJson());
            if (strengths.stream().anyMatch(s -> s.equalsIgnoreCase(skillName))) {
                leetcodeEvidence = "User solved interview problems in LeetCode with ranking: " + lcOpt.get().getRanking() 
                        + ", reflecting algorithmic strength in topic matching this domain.";
            }
        }

        // 4. Call FastAPI
        Map<String, String> requestBody = Map.of(
                "skill_name", skillName,
                "resume_evidence", resumeEvidence,
                "github_evidence", githubEvidence,
                "leetcode_evidence", leetcodeEvidence
        );

        log.info("Calling FastAPI RAG service /rag/skill-validation for user {} / skill {}", userId, skillName);
        RagSkillValidationResponse response = ragWebClient.post()
                .uri("/rag/skill-validation")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(RagSkillValidationResponse.class)
                .block();

        // 5. Cache response (Expires in 7 days)
        if (response != null) {
            saveToCache(userId, "SKILL_VALIDATION", cacheKey, response, Duration.ofDays(7));
        }

        return response;
    }

    @Transactional
    public RagRoadmapResponse generateRoadmap(Long userId, String targetRole) {
        String cacheKey = "role:" + targetRole;
        // 1. Check cache
        Optional<RagRoadmapResponse> cached = getFromCache(userId, "ROADMAP", cacheKey, RagRoadmapResponse.class);
        if (cached.isPresent()) {
            log.info("Returning cached Roadmap RAG for user {} / role {}", userId, targetRole);
            return cached.get();
        }

        // 2. Fetch User & Current skills
        User user = ensureUser(userId);
        List<String> currentSkills = getSkillNames(userId);
        List<String> careerGoals = getCareerGoals(userId);

        // 3. Call FastAPI
        Map<String, Object> requestBody = Map.of(
                "current_skills", currentSkills,
                "target_role", targetRole,
                "experience_years", 3, // default mid level
                "career_goals", careerGoals
        );

        log.info("Calling FastAPI RAG service /rag/roadmap for user {} / target role {}", userId, targetRole);
        RagRoadmapResponse response = ragWebClient.post()
                .uri("/rag/roadmap")
                .bodyValue(requestBody)
                .retrieve()
                .bodyToMono(RagRoadmapResponse.class)
                .block();

        // 4. Cache response (Expires in 24 hours)
        if (response != null) {
            saveToCache(userId, "ROADMAP", cacheKey, response, Duration.ofHours(24));
        }

        return response;
    }

    // --- Helper Methods ---

    private User ensureUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
    }

    private List<String> getSkillNames(Long userId) {
        return userSkillRepository.findByUserId(userId).stream()
                .map(us -> us.getSkill().getName())
                .distinct()
                .collect(Collectors.toList());
    }

    private List<String> getCareerGoals(Long userId) {
        // Look up registered job roles to suggest goals, or default
        List<String> roles = jobRoleRepository.findAll().stream()
                .map(JobRole::getTitle)
                .limit(3)
                .collect(Collectors.toList());
        if (roles.isEmpty()) {
            return List.of("Software Engineer", "Backend Engineer");
        }
        return roles;
    }

    private List<String> readJsonStringList(String json) {
        if (json == null || json.isBlank()) return List.of();
        try {
            return objectMapper.readValue(json, 
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class));
        } catch (Exception e) {
            log.error("Failed to parse JSON string list: {}", json, e);
            return List.of();
        }
    }

    private String findSentencesContainingKeyword(String text, String keyword) {
        if (text == null || text.isBlank() || keyword == null || keyword.isBlank()) {
            return "";
        }
        // Split by period to search for sentences
        String[] sentences = text.split("\\.");
        List<String> matched = new ArrayList<>();
        String keywordLower = keyword.toLowerCase();
        
        for (String sentence : sentences) {
            if (sentence.toLowerCase().contains(keywordLower)) {
                matched.add(sentence.trim());
            }
            if (matched.size() >= 3) break; // cap evidence sentences
        }
        return String.join(". ", matched);
    }

    private <T> Optional<T> getFromCache(Long userId, String type, String key, Class<T> clazz) {
        Optional<RagAnalysisCache> cached = cacheRepository
                .findByUserIdAndAnalysisTypeAndCacheKeyAndExpiresAtAfter(userId, type, key, Instant.now());
        if (cached.isPresent()) {
            try {
                return Optional.of(objectMapper.readValue(cached.get().getResponseJson(), clazz));
            } catch (Exception e) {
                log.error("Failed to deserialize cached RAG response of type {}", type, e);
            }
        }
        return Optional.empty();
    }

    private <T> void saveToCache(Long userId, String type, String key, T response, Duration ttl) {
        try {
            String json = objectMapper.writeValueAsString(response);
            // Delete old one if exists
            cacheRepository.deleteByUserIdAndAnalysisTypeAndCacheKey(userId, type, key);
            
            RagAnalysisCache cacheEntry = new RagAnalysisCache();
            cacheEntry.setUserId(userId);
            cacheEntry.setAnalysisType(type);
            cacheEntry.setCacheKey(key);
            cacheEntry.setResponseJson(json);
            cacheEntry.setCreatedAt(Instant.now());
            cacheEntry.setExpiresAt(Instant.now().plus(ttl));
            cacheRepository.save(cacheEntry);
        } catch (Exception e) {
            log.error("Failed to save RAG response to cache of type {}", type, e);
        }
    }
}
