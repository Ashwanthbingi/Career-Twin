package com.twinos.career.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GitHubAnalysisRequest(
        @NotNull Long userId,
        @NotBlank String githubUsername
) {
}
