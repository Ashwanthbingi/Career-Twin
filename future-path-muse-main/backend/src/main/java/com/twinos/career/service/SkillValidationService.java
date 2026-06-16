package com.twinos.career.service;

import com.twinos.career.dto.SkillConfidenceSummaryResponse;
import com.twinos.career.dto.SkillEvidenceDto;
import com.twinos.career.dto.ValidatedSkillResponse;
import com.twinos.career.entity.SkillEvidenceSource;
import com.twinos.career.entity.SkillValidation;
import com.twinos.career.entity.UserSkill;
import com.twinos.career.exception.ResourceNotFoundException;
import com.twinos.career.repository.SkillValidationRepository;
import com.twinos.career.repository.UserRepository;
import com.twinos.career.repository.UserSkillRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.Arrays;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SkillValidationService {

    private static final Map<SkillEvidenceSource, Integer> WEIGHTS = Map.of(
            SkillEvidenceSource.RESUME, 20,
            SkillEvidenceSource.GITHUB, 35,
            SkillEvidenceSource.PROJECT, 25,
            SkillEvidenceSource.CERTIFICATION, 15,
            SkillEvidenceSource.LEETCODE, 25
    );

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillValidationRepository skillValidationRepository;

    public SkillValidationService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            SkillValidationRepository skillValidationRepository
    ) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.skillValidationRepository = skillValidationRepository;
    }

    @Transactional
    public List<ValidatedSkillResponse> getValidatedSkills(Long userId) {
        ensureUser(userId);
        syncValidationsFromUserSkills(userId);

        Map<String, List<SkillValidation>> grouped = skillValidationRepository.findByUserId(userId).stream()
                .collect(Collectors.groupingBy(
                        validation -> validation.getSkillName().trim(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        return grouped.entrySet().stream()
                .map(entry -> toValidatedSkill(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparingInt(ValidatedSkillResponse::confidence).reversed()
                        .thenComparing(ValidatedSkillResponse::skill))
                .toList();
    }

    @Transactional
    public SkillConfidenceSummaryResponse getConfidenceSummary(Long userId) {
        List<ValidatedSkillResponse> skills = getValidatedSkills(userId);
        int high = 0;
        int medium = 0;
        int low = 0;

        for (ValidatedSkillResponse skill : skills) {
            if (skill.confidence() >= 80) {
                high++;
            } else if (skill.confidence() >= 50) {
                medium++;
            } else {
                low++;
            }
        }

        return new SkillConfidenceSummaryResponse(high, medium, low);
    }

    private void syncValidationsFromUserSkills(Long userId) {
        for (UserSkill userSkill : userSkillRepository.findByUserId(userId)) {
            Set<SkillEvidenceSource> sources = parseSources(userSkill.getSource());
            for (SkillEvidenceSource source : sources) {
                upsertValidation(
                        userId,
                        userSkill.getSkill().getName(),
                        source,
                        evidenceText(source, userSkill.getSkill().getName())
                );
            }
        }
    }

    public void upsertValidation(Long userId, String skillName, SkillEvidenceSource source, String evidenceText) {
        upsertValidation(userId, skillName, source, evidenceText, WEIGHTS.getOrDefault(source, 0));
    }

    public void upsertValidation(
            Long userId,
            String skillName,
            SkillEvidenceSource source,
            String evidenceText,
            int confidenceScore
    ) {
        SkillValidation validation = skillValidationRepository
                .findByUserIdAndSkillNameIgnoreCaseAndSource(userId, skillName, source)
                .orElseGet(SkillValidation::new);

        validation.setUserId(userId);
        validation.setSkillName(skillName);
        validation.setSource(source);
        validation.setEvidence(evidenceText);
        validation.setConfidenceScore(confidenceScore);
        skillValidationRepository.save(validation);
    }

    private ValidatedSkillResponse toValidatedSkill(String skillName, List<SkillValidation> rows) {
        int confidence = rows.stream()
                .map(SkillValidation::getSource)
                .distinct()
                .mapToInt(source -> WEIGHTS.getOrDefault(source, 0))
                .sum();

        List<String> sources = rows.stream()
                .map(SkillValidation::getSource)
                .distinct()
                .sorted(Comparator.comparing(Enum::name))
                .map(this::displaySource)
                .toList();

        List<SkillEvidenceDto> evidence = rows.stream()
                .sorted(Comparator.comparing(row -> row.getSource().name()))
                .map(row -> new SkillEvidenceDto(
                        displaySource(row.getSource()),
                        row.getEvidence(),
                        row.getConfidenceScore(),
                        DateTimeFormatter.ISO_INSTANT.format(row.getCreatedAt())
                ))
                .toList();

        return new ValidatedSkillResponse(skillName, Math.min(100, confidence), sources, evidence);
    }

    private Set<SkillEvidenceSource> parseSources(String sourceValue) {
        if (sourceValue == null || sourceValue.isBlank()) {
            return Set.of();
        }

        return Arrays.stream(sourceValue.split(","))
                .map(value -> value.trim().toUpperCase(Locale.ROOT))
                .map(this::toEvidenceSource)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    private SkillEvidenceSource toEvidenceSource(String source) {
        return switch (source) {
            case "RESUME" -> SkillEvidenceSource.RESUME;
            case "GITHUB" -> SkillEvidenceSource.GITHUB;
            case "PROJECT", "PROJECTS" -> SkillEvidenceSource.PROJECT;
            case "CERTIFICATION", "CERTIFICATIONS" -> SkillEvidenceSource.CERTIFICATION;
            case "LEETCODE" -> SkillEvidenceSource.LEETCODE;
            default -> null;
        };
    }

    private String evidenceText(SkillEvidenceSource source, String skillName) {
        return switch (source) {
            case RESUME -> skillName + " was extracted from the uploaded resume.";
            case GITHUB -> skillName + " was detected by the GitHub analyzer from public repository signals.";
            case PROJECT -> skillName + " was linked from stored project evidence.";
            case CERTIFICATION -> skillName + " was linked from stored certification evidence.";
            case LEETCODE -> skillName + " was validated from LeetCode topic analysis and problem-solving signals.";
        };
    }

    private String displaySource(SkillEvidenceSource source) {
        return switch (source) {
            case RESUME -> "Resume";
            case GITHUB -> "GitHub";
            case PROJECT -> "Projects";
            case CERTIFICATION -> "Certifications";
            case LEETCODE -> "LeetCode";
        };
    }

    private void ensureUser(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }
    }
}
