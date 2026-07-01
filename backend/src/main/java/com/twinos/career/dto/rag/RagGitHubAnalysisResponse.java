package com.twinos.career.dto.rag;

import java.util.List;

public record RagGitHubAnalysisResponse(
    List<VerifiedSkill> verifiedSkills,
    Complexity projectComplexity,
    Maturity engineeringMaturity,
    List<PortfolioSkill> missingPortfolioSkills,
    String summary
) {
    public record VerifiedSkill(String name, double confidence, String evidence) {}
    public record Complexity(int score, String level, String reasoning) {}
    public record Maturity(int score, String level, List<String> indicators) {}
    public record PortfolioSkill(String name, String importance, String suggestion) {}
}
