package com.twinos.career.dto;

import java.util.List;

public record RoadmapResponse(
        Long userId,
        Long targetRoleId,
        String targetRoleTitle,
        List<RoadmapMilestoneDto> milestones
) {
}
