package com.twinos.career.controller;

import com.twinos.career.dto.RoadmapResponse;
import com.twinos.career.service.RoadmapService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roadmap")
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @GetMapping
    public RoadmapResponse getRoadmap(
            @RequestParam Long userId,
            @RequestParam Long targetRoleId
    ) {
        return roadmapService.generateRoadmap(userId, targetRoleId);
    }
}
