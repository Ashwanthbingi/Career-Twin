package com.twinos.career.dto;

import java.util.List;

public record RoadmapMilestoneDto(
        int order,
        String title,
        String description,
        List<String> skills,
        List<String> actions
) {
}
