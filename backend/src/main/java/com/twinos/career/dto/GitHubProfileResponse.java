package com.twinos.career.dto;

import java.util.List;

public record GitHubProfileResponse(
        Long userId,
        String githubUsername,
        int repositories,
        int stars,
        int contributionScore,
        String recommendedRole,
        List<String> languages,
        List<String> detectedSkills,
        String updatedAt
) {
}
