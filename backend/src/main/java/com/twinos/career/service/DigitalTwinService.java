package com.twinos.career.service;

import com.twinos.career.dto.CareerMatchDto;
import com.twinos.career.dto.DigitalTwinResponse;
import com.twinos.career.dto.RoadmapResponse;
import com.twinos.career.dto.SkillDto;
import com.twinos.career.dto.SkillGapResponse;
import com.twinos.career.dto.SkillGraphDto;
import com.twinos.career.entity.GitHubProfile;
import com.twinos.career.entity.LeetCodeProfile;
import com.twinos.career.entity.Resume;
import com.twinos.career.entity.User;
import com.twinos.career.entity.UserSkill;
import com.twinos.career.exception.ResourceNotFoundException;
import com.twinos.career.repository.GitHubProfileRepository;
import com.twinos.career.repository.LeetCodeProfileRepository;
import com.twinos.career.repository.ResumeRepository;
import com.twinos.career.repository.UserRepository;
import com.twinos.career.repository.UserSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class DigitalTwinService {

    private static final DateTimeFormatter API_DATE_FORMAT = DateTimeFormatter.ISO_INSTANT;

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final ResumeRepository resumeRepository;
    private final GitHubProfileRepository gitHubProfileRepository;
    private final LeetCodeProfileRepository leetCodeProfileRepository;
    private final CareerMatchService careerMatchService;
    private final SkillGapService skillGapService;
    private final RoadmapService roadmapService;

    public DigitalTwinService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            ResumeRepository resumeRepository,
            GitHubProfileRepository gitHubProfileRepository,
            LeetCodeProfileRepository leetCodeProfileRepository,
            CareerMatchService careerMatchService,
            SkillGapService skillGapService,
            RoadmapService roadmapService
    ) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.resumeRepository = resumeRepository;
        this.gitHubProfileRepository = gitHubProfileRepository;
        this.leetCodeProfileRepository = leetCodeProfileRepository;
        this.careerMatchService = careerMatchService;
        this.skillGapService = skillGapService;
        this.roadmapService = roadmapService;
    }

    @Transactional(readOnly = true)
    public DigitalTwinResponse buildTwin(Long userId) {
        return computeTwin(userId);
    }

    @Transactional(readOnly = true)
    public DigitalTwinResponse refreshTwin(Long userId) {
        return computeTwin(userId);
    }

    @Transactional(readOnly = true)
    public List<CareerMatchDto> getCareerMatches(Long userId) {
        ensureUser(userId);
        return careerMatchService.getCareerMatches(userId);
    }

    @Transactional(readOnly = true)
    public SkillGapResponse getSkillGap(Long userId, Long targetRoleId) {
        ensureUser(userId);
        return skillGapService.analyzeSkillGap(userId, targetRoleId);
    }

    @Transactional(readOnly = true)
    public RoadmapResponse getRoadmap(Long userId, Long targetRoleId) {
        ensureUser(userId);
        return roadmapService.generateRoadmap(userId, targetRoleId);
    }

    @Transactional(readOnly = true)
    public List<SkillGraphDto> getSkillGraph(Long userId) {
        ensureUser(userId);
        List<UserSkill> userSkills = userSkillRepository.findByUserId(userId);
        List<CareerMatchDto> careerMatches = careerMatchService.getCareerMatches(userId);
        return buildSkillGraph(userSkills, careerMatches);
    }

    private DigitalTwinResponse computeTwin(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        List<UserSkill> userSkills = userSkillRepository.findByUserId(userId);
        List<SkillDto> detectedSkills = userSkills.stream()
                .map(userSkill -> toSkillDto(userSkill.getSkill()))
                .sorted(Comparator.comparing(SkillDto::category).thenComparing(SkillDto::name))
                .toList();

        List<CareerMatchDto> careerMatches = careerMatchService.getCareerMatches(userId);
        CareerMatchDto topMatch = careerMatches.stream()
                .max(Comparator.comparingInt(CareerMatchDto::matchScore))
                .orElse(null);

        SkillGapResponse skillGap = topMatch == null
                ? SkillGapResponse.empty()
                : skillGapService.analyzeSkillGap(userId, topMatch.roleId());
        RoadmapResponse roadmap = topMatch == null
                ? RoadmapResponse.empty()
                : roadmapService.generateRoadmap(userId, topMatch.roleId());

        List<SkillGraphDto> skillGraph = buildSkillGraph(userSkills, careerMatches);
        List<String> strengths = skillGraph.stream()
                .limit(5)
                .map(SkillGraphDto::name)
                .toList();
        List<String> weaknesses = skillGap.missingSkills().stream()
                .limit(5)
                .map(SkillDto::name)
                .toList();

        int baseReadiness = topMatch == null ? 0 : topMatch.matchScore();
        int readinessScore = applyLeetCodeReadinessBoost(userId, baseReadiness);

        Optional<Resume> resume = resumeRepository.findByUserIdAndActiveTrue(userId);
        Optional<GitHubProfile> github = gitHubProfileRepository.findByUserId(userId);
        Optional<LeetCodeProfile> leetcode = leetCodeProfileRepository.findByUserId(userId);

        Instant lastUpdated = maxInstant(
                resume.map(Resume::getUpdatedAt).orElse(null),
                github.map(GitHubProfile::getUpdatedAt).orElse(null),
                leetcode.map(LeetCodeProfile::getUpdatedAt).orElse(null)
        );

        return new DigitalTwinResponse(
                user.getId(),
                user.getName(),
                readinessScore,
                topMatch == null ? "Undiscovered" : topMatch.title(),
                topMatch == null ? null : topMatch.roleId(),
                detectedSkills,
                skillGap.missingSkills(),
                strengths,
                weaknesses,
                projectedCareer(topMatch, skillGap),
                salaryProjection(readinessScore),
                detectedSkills.size(),
                Math.max(1, detectedSkills.size() / 2),
                lastUpdated == null ? API_DATE_FORMAT.format(Instant.now()) : API_DATE_FORMAT.format(lastUpdated),
                skillGraph,
                careerMatches,
                skillGap,
                roadmap,
                resume.isPresent(),
                github.isPresent(),
                leetcode.isPresent()
        );
    }

    private List<SkillGraphDto> buildSkillGraph(List<UserSkill> userSkills, List<CareerMatchDto> careerMatches) {
        Map<Long, Integer> strengths = new HashMap<>();
        for (CareerMatchDto match : careerMatches) {
            for (SkillDto matchedSkill : match.matchedSkillDetails()) {
                strengths.merge(matchedSkill.id(), match.matchScore(), Math::max);
            }
        }

        return userSkills.stream()
                .map(userSkill -> new SkillGraphDto(
                        userSkill.getSkill().getId(),
                        userSkill.getSkill().getName(),
                        userSkill.getSkill().getCategory(),
                        Math.min(100, strengths.getOrDefault(userSkill.getSkill().getId(), 35)),
                        1
                ))
                .sorted(Comparator.comparingInt(SkillGraphDto::strength).reversed()
                        .thenComparing(SkillGraphDto::name))
                .toList();
    }

    private int applyLeetCodeReadinessBoost(Long userId, int baseReadiness) {
        return leetCodeProfileRepository.findByUserId(userId)
                .map(profile -> Math.min(
                        100,
                        Math.round((baseReadiness * 0.85f) + (profile.getProblemSolvingScore() * 0.15f))
                ))
                .orElse(baseReadiness);
    }

    private String projectedCareer(CareerMatchDto topMatch, SkillGapResponse skillGap) {
        if (topMatch == null) {
            return "Build a stronger skill signal to unlock career projections.";
        }
        if (skillGap.missingSkills().isEmpty()) {
            return "Ready to pursue " + topMatch.title() + " now.";
        }
        return "On track for " + topMatch.title() + " after closing "
                + Math.min(3, skillGap.missingSkills().size()) + " priority skill gaps.";
    }

    private String salaryProjection(int readinessScore) {
        if (readinessScore >= 85) {
            return "$140k-$180k";
        }
        if (readinessScore >= 65) {
            return "$110k-$145k";
        }
        if (readinessScore >= 40) {
            return "$85k-$120k";
        }
        return "$65k-$95k";
    }

    private SkillDto toSkillDto(com.twinos.career.entity.Skill skill) {
        return new SkillDto(skill.getId(), skill.getName(), skill.getCategory());
    }

    private Instant maxInstant(Instant... values) {
        Instant max = null;
        for (Instant value : values) {
            if (value != null && (max == null || value.isAfter(max))) {
                max = value;
            }
        }
        return max;
    }

    private void ensureUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }
    }
}
