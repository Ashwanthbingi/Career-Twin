package com.twinos.career.dto;

import java.util.List;

public record ResumeUploadResponse(
        Long userId,
        int detectedSkillCount,
        List<SkillDto> detectedSkills,
        String extractedTextPreview,
        DigitalTwinRefreshResult refresh
) {
}
