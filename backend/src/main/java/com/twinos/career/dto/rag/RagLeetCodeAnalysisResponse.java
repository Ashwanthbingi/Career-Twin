package com.twinos.career.dto.rag;

import java.util.List;

public record RagLeetCodeAnalysisResponse(
    int problemSolvingScore,
    List<AlgoTopic> algorithmStrengths,
    List<AlgoTopic> algorithmWeaknesses,
    Readiness interviewReadiness,
    List<String> improvementPlan,
    String summary
) {
    public record AlgoTopic(String topic, int score, String assessment, String recommendation) {}
    public record Readiness(int serviceCompanies, int productCompanies, int faangLevel, String reasoning) {}
}
