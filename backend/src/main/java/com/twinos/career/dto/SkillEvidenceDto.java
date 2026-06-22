package com.twinos.career.dto;

public record SkillEvidenceDto(
        String source,
        String evidence,
        int confidenceScore,
        String createdAt
) {
}
