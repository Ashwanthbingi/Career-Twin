package com.twinos.career.service;

import com.twinos.career.dto.CareerMatchDto;
import com.twinos.career.dto.SkillDto;
import com.twinos.career.entity.JobRole;
import com.twinos.career.entity.Skill;
import com.twinos.career.exception.ResourceNotFoundException;
import com.twinos.career.repository.JobRoleRepository;
import com.twinos.career.repository.RoleSkillRepository;
import com.twinos.career.repository.SkillRepository;
import com.twinos.career.repository.UserRepository;
import com.twinos.career.repository.UserSkillRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class CareerMatchService {

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final JobRoleRepository jobRoleRepository;
    private final RoleSkillRepository roleSkillRepository;
    private final SkillRepository skillRepository;

    public CareerMatchService(
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

    public List<CareerMatchDto> getCareerMatches(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        Set<Long> userSkillIds = new HashSet<>(userSkillRepository.findSkillIdsByUserId(userId));

        return jobRoleRepository.findAll().stream()
                .map(role -> buildMatch(role, userSkillIds))
                .sorted(Comparator.comparingInt(CareerMatchDto::matchScore).reversed()
                        .thenComparing(CareerMatchDto::title))
                .toList();
    }

    private CareerMatchDto buildMatch(JobRole role, Set<Long> userSkillIds) {
        List<Long> requiredSkillIds = roleSkillRepository.findSkillIdsByRoleId(role.getId());
        int requiredSkills = requiredSkillIds.size();

        List<Long> matchedSkillIds = requiredSkillIds.stream()
                .filter(userSkillIds::contains)
                .toList();

        int matchedSkills = matchedSkillIds.size();
        int matchScore = requiredSkills == 0 ? 0 : (matchedSkills * 100) / requiredSkills;

        List<SkillDto> matchedSkillDetails = matchedSkillIds.stream()
                .map(skillRepository::findById)
                .flatMap(java.util.Optional::stream)
                .map(this::toSkillDto)
                .toList();

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

    private SkillDto toSkillDto(Skill skill) {
        return new SkillDto(skill.getId(), skill.getName(), skill.getCategory());
    }
}
