package com.twinos.career.controller;

import com.twinos.career.dto.RoadmapResponse;
import com.twinos.career.service.DigitalTwinService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/roadmap")
public class RoadmapController {

    private final DigitalTwinService digitalTwinService;

    public RoadmapController(DigitalTwinService digitalTwinService) {
        this.digitalTwinService = digitalTwinService;
    }

    @GetMapping
    public RoadmapResponse getRoadmap(
            @RequestParam Long userId,
            @RequestParam Long targetRoleId
    ) {
        return digitalTwinService.getRoadmap(userId, targetRoleId);
    }
}
