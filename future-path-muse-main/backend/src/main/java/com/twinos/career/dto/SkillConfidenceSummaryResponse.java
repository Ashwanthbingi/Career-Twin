package com.twinos.career.dto;

public record SkillConfidenceSummaryResponse(
        int highConfidence,
        int mediumConfidence,
        int lowConfidence
) {
}
