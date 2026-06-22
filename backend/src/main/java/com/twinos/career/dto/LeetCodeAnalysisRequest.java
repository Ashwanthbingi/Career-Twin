package com.twinos.career.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LeetCodeAnalysisRequest(
        @NotNull Long userId,
        @NotBlank String username
) {
}
