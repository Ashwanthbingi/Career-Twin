package com.twinos.career.service;

import com.twinos.career.dto.DigitalTwinRefreshResult;
import com.twinos.career.dto.DigitalTwinResponse;
import org.springframework.stereotype.Service;

@Service
public class DigitalTwinRefreshService {

    private final DigitalTwinService digitalTwinService;

    public DigitalTwinRefreshService(DigitalTwinService digitalTwinService) {
        this.digitalTwinService = digitalTwinService;
    }

    public DigitalTwinRefreshResult refreshAfterResumeUpload(Long userId) {
        return refreshTwin(userId);
    }

    public DigitalTwinRefreshResult refreshTwin(Long userId) {
        DigitalTwinResponse twin = digitalTwinService.buildTwin(userId);

        return new DigitalTwinRefreshResult(
                userId,
                twin.topCareerRoleId(),
                twin.topCareer(),
                twin.careerMatches().size(),
                twin.skillGap().matchedSkills().size(),
                twin.skillGap().missingSkills().size(),
                twin.roadmap().milestones().size(),
                twin.readinessScore(),
                "REFRESHED"
        );
    }
}
