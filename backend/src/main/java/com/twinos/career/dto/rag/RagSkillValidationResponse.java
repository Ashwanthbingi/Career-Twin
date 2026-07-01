package com.twinos.career.dto.rag;

import java.util.List;

public record RagSkillValidationResponse(
    String skill,
    int confidence,
    List<EvidenceDetail> evidenceSummary,
    String industryContext,
    List<String> relatedSkills,
    List<String> growthSuggestions
) {
    public record EvidenceDetail(String source, int strength, String detail) {}
}
