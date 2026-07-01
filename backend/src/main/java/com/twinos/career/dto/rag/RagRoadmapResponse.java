package com.twinos.career.dto.rag;

import java.util.List;

public record RagRoadmapResponse(
    String targetRole,
    String estimatedTimeline,
    List<PhaseDetail> phases,
    String summary
) {
    public record PhaseDetail(
        int phase,
        String title,
        String duration,
        List<String> skillsToLearn,
        List<String> actions,
        List<String> resources,
        List<String> milestones
    ) {}
}
