package com.twinos.career.dto.rag;

import java.util.List;

public record RagResumeAnalysisResponse(
    List<InferredSkill> inferredSkills,
    List<InferredSkill> hiddenSkills,
    List<Strength> strengths,
    List<Weakness> weaknesses,
    List<Suitability> careerSuitability,
    String summary
) {
    public record InferredSkill(String name, double confidence, String evidence) {}
    public record Strength(String area, int score, String evidence) {}
    public record Weakness(String area, int score, String evidence) {}
    public record Suitability(String role, int score, String reasoning) {}
}
