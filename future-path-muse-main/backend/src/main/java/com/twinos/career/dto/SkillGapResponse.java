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
        public static SkillGapResponse empty() {
                return new SkillGapResponse(0L, 0L, "", List.of(), List.of(), List.of());
        }
}
