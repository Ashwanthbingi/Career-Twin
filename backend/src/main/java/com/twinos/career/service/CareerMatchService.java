package com.twinos.career.service;

import com.twinos.career.dto.CareerMatchDto;
import com.twinos.career.dto.SkillDto;
import com.twinos.career.entity.JobRole;
import com.twinos.career.entity.RoleSkill;
import com.twinos.career.entity.Skill;
import com.twinos.career.exception.ResourceNotFoundException;
import com.twinos.career.repository.JobRoleRepository;
import com.twinos.career.repository.LeetCodeProfileRepository;
import com.twinos.career.repository.RoleSkillRepository;
import com.twinos.career.repository.UserRepository;
import com.twinos.career.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;

@Service
public class CareerMatchService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final JobRoleRepository jobRoleRepository;
    private final RoleSkillRepository roleSkillRepository;
    private final LeetCodeProfileRepository leetCodeProfileRepository;

    public CareerMatchService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            JobRoleRepository jobRoleRepository,
            RoleSkillRepository roleSkillRepository,
            LeetCodeProfileRepository leetCodeProfileRepository
    ) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.jobRoleRepository = jobRoleRepository;
        this.roleSkillRepository = roleSkillRepository;
        this.leetCodeProfileRepository = leetCodeProfileRepository;
    }

    public List<CareerMatchDto> getCareerMatches(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        Set<Long> userSkillIds = new HashSet<>(userSkillRepository.findSkillIdsByUserId(userId));

        return jobRoleRepository.findAll().stream()
                .map(role -> buildMatch(role, userSkillIds, userId))
                .sorted(Comparator.comparingInt(CareerMatchDto::matchScore).reversed()
                        .thenComparing(CareerMatchDto::title))
                .toList();
    }

    private CareerMatchDto buildMatch(JobRole role, Set<Long> userSkillIds, Long userId) {
        List<RoleSkill> requirements = roleSkillRepository.findRequirementsByRoleId(role.getId());
        int requiredSkills = requirements.size();

        List<SkillDto> matchedSkillDetails = requirements.stream()
                .map(RoleSkill::getSkill)
                .filter(skill -> userSkillIds.contains(skill.getId()))
                .map(this::toSkillDto)
                .toList();

        int matchedSkills = matchedSkillDetails.size();
        int matchScore = requiredSkills == 0 ? 0 : (matchedSkills * 100) / requiredSkills;
        matchScore = applyLeetCodeMatchBoost(userId, role.getTitle(), matchScore);

        return new CareerMatchDto(
                role.getId(),
                role.getTitle(),
                role.getDescription(),
                matchScore,
                matchedSkills,
                requiredSkills,
                matchedSkillDetails
        );
    }

    private int applyLeetCodeMatchBoost(Long userId, String roleTitle, int baseScore) {
        if (!isEngineeringRole(roleTitle)) {
            return baseScore;
        }
        return leetCodeProfileRepository.findByUserId(userId)
                .map(profile -> Math.min(
                        100,
                        Math.round(baseScore * 0.75f + profile.getProblemSolvingScore() * 0.25f)
                ))
                .orElse(baseScore);
    }

    private boolean isEngineeringRole(String roleTitle) {
        String normalized = roleTitle.toLowerCase(Locale.ROOT);
        return normalized.contains("software") || normalized.contains("engineer") || normalized.contains("developer");
    }

    private SkillDto toSkillDto(Skill skill) {
        return new SkillDto(skill.getId(), skill.getName(), skill.getCategory());
    }
}
