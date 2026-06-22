package com.twinos.career.dto;

public record ResumeResponse(
        Long userId,
        String originalFilename,
        long fileSize,
        String contentType,
        String storagePath,
        String uploadedAt,
        String updatedAt,
        int detectedSkillCount,
        String extractedTextPreview
) {
}
