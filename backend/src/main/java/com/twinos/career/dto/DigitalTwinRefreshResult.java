package com.twinos.career.dto;

public record DigitalTwinRefreshResult(
        Long userId,
        Long targetRoleId,
        String targetRoleTitle,
        int careerMatchCount,
        int matchedSkillCount,
        int missingSkillCount,
        int roadmapMilestoneCount,
        int readinessScore,
        String status
) {
}
