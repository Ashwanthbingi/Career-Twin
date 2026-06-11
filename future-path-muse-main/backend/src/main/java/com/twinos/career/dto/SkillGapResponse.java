package com.twinos.career.dto;

import java.util.List;

public record SkillGapResponse(
        Long userId,
        Long targetRoleId,
        String targetRoleTitle,
        List<SkillDto> matchedSkills,
        List<SkillDto> missingSkills,
        List<String> recommendations
) {
}
