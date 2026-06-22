package com.twinos.career.dto;

import java.util.List;

public record CareerMatchDto(
        Long roleId,
        String title,
        String description,
        int matchScore,
        int matchedSkills,
        int requiredSkills,
        List<SkillDto> matchedSkillDetails
) {
}
