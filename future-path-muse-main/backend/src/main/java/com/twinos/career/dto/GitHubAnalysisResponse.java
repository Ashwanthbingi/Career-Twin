package com.twinos.career.dto;

import java.util.List;

public record GitHubAnalysisResponse(
        int repositories,
        int stars,
        List<String> languages,
        List<String> detectedSkills,
        int contributionScore,
        String recommendedRole
) {
}
