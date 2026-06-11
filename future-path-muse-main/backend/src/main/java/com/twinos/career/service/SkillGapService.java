package com.twinos.career.service;

import com.twinos.career.dto.SkillDto;
import com.twinos.career.dto.SkillGapResponse;
import com.twinos.career.entity.JobRole;
import com.twinos.career.entity.Skill;
import com.twinos.career.exception.ResourceNotFoundException;
import com.twinos.career.repository.JobRoleRepository;
import com.twinos.career.repository.RoleSkillRepository;
import com.twinos.career.repository.SkillRepository;
import com.twinos.career.repository.UserRepository;
import com.twinos.career.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class SkillGapService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final JobRoleRepository jobRoleRepository;
    private final RoleSkillRepository roleSkillRepository;
    private final SkillRepository skillRepository;

    public SkillGapService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            JobRoleRepository jobRoleRepository,
            RoleSkillRepository roleSkillRepository,
            SkillRepository skillRepository
    ) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.roleSkillRepository = roleSkillRepository;
        this.skillRepository = skillRepository;
    }

    public SkillGapResponse analyzeSkillGap(Long userId, Long targetRoleId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        JobRole role = jobRoleRepository.findById(targetRoleId)
                .orElseThrow(() -> new ResourceNotFoundException("Job role not found: " + targetRoleId));

        Set<Long> userSkillIds = new HashSet<>(userSkillRepository.findSkillIdsByUserId(userId));
        List<Long> requiredSkillIds = roleSkillRepository.findSkillIdsByRoleId(targetRoleId);

        List<SkillDto> matchedSkills = new ArrayList<>();
        List<SkillDto> missingSkills = new ArrayList<>();

        for (Long skillId : requiredSkillIds) {
            Skill skill = skillRepository.findById(skillId)
                    .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + skillId));
            SkillDto dto = new SkillDto(skill.getId(), skill.getName(), skill.getCategory());

            if (userSkillIds.contains(skillId)) {
                matchedSkills.add(dto);
            } else {
                missingSkills.add(dto);
            }
        }

        List<String> recommendations = buildRecommendations(role, missingSkills);

        return new SkillGapResponse(
                userId,
                targetRoleId,
                role.getTitle(),
                matchedSkills,
                missingSkills,
                recommendations
        );
    }

    private List<String> buildRecommendations(JobRole role, List<SkillDto> missingSkills) {
        List<String> recommendations = new ArrayList<>();

        if (missingSkills.isEmpty()) {
            recommendations.add("You already meet all required skills for " + role.getTitle() + ".");
            recommendations.add("Focus on portfolio projects and interview preparation to stand out.");
            return recommendations;
        }

        for (SkillDto skill : missingSkills) {
            recommendations.add(buildRecommendation(skill));
        }

        recommendations.add("Prioritize the top 2-3 missing skills to close the largest gaps first.");
        return recommendations;
    }

    private String buildRecommendation(SkillDto skill) {
        return switch (skill.category()) {
            case "Technical" -> "Complete a hands-on project focused on " + skill.name()
                    + " and add it to your portfolio.";
            case "Leadership" -> "Seek a stretch assignment or mentorship opportunity to practice "
                    + skill.name() + ".";
            case "Communication" -> "Practice " + skill.name()
                    + " through presentations, writing, or stakeholder workshops.";
            case "Data" -> "Take a structured course in " + skill.name()
                    + " and apply it to a real dataset.";
            default -> "Dedicate 4-6 weeks to building proficiency in " + skill.name() + ".";
        };
    }
}
