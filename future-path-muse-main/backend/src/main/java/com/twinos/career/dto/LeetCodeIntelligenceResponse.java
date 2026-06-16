package com.twinos.career.dto;

import java.util.List;

public record LeetCodeIntelligenceResponse(
        Long userId,
        String username,
        int totalSolved,
        int easySolved,
        int mediumSolved,
        int hardSolved,
        int contestRating,
        int ranking,
        int problemSolvingScore,
        InterviewReadinessDto interviewReadiness,
        List<LeetCodeTopicScoreDto> topicBreakdown,
        List<String> strengths,
        List<String> weaknesses,
        List<CodingTimelineDto> growthTimeline,
        String updatedAt
) {
}
