package com.twinos.career.dto;

import java.util.List;

public record ValidatedSkillResponse(
        String skill,
        int confidence,
        List<String> sources,
        List<SkillEvidenceDto> evidence
) {
}
