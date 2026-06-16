package com.twinos.career.dto;

public record SkillGraphDto(
        Long skillId,
        String name,
        String category,
        int strength,
        int evidenceCount
) {
}
