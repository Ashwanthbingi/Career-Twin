package com.twinos.career.dto;

import java.util.List;

public record DigitalTwinResponse(
        Long userId,
        String userName,
        int readinessScore,
        String topCareer,
        Long topCareerRoleId,
        List<SkillDto> detectedSkills,
        List<SkillDto> missingSkills,
        List<String> strengths,
        List<String> weaknesses,
        String projectedCareer,
        String salaryProjection,
        int skillsCount,
        int projectsCount,
        String lastUpdatedAt,
        List<SkillGraphDto> skillGraph,
        List<CareerMatchDto> careerMatches,
        SkillGapResponse skillGap,
        RoadmapResponse roadmap,
        boolean hasResume,
        boolean hasGitHubProfile,
        boolean hasLeetCodeProfile
) {
}
