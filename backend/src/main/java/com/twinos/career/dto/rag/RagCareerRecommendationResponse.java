package com.twinos.career.dto.rag;

import java.util.List;

public record RagCareerRecommendationResponse(
    List<Recommendation> recommendations,
    String summary
) {
    public record Recommendation(
        String role,
        int score,
        String reasoning,
        Evidence evidence,
        List<String> gaps,
        List<String> nextSteps
    ) {}

    public record Evidence(
        String resume,
        String github,
        String leetcode
    ) {}
}
