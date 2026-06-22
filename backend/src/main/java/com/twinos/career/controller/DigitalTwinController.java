package com.twinos.career.controller;

import com.twinos.career.dto.DigitalTwinResponse;
import com.twinos.career.dto.SkillGraphDto;
import com.twinos.career.service.DigitalTwinService;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class DigitalTwinController {

    private final DigitalTwinService digitalTwinService;

    public DigitalTwinController(
            DigitalTwinService digitalTwinService) {

        this.digitalTwinService = digitalTwinService;
    }

    @GetMapping("/digital-twin")
    public DigitalTwinResponse getTwin(
            @RequestParam Long userId) {

        return digitalTwinService.buildTwin(userId);
    }

    @PostMapping("/digital-twin/refresh")
    public DigitalTwinResponse refreshTwin(
            @RequestParam Long userId) {

        return digitalTwinService.refreshTwin(userId);
    }

    @GetMapping("/digital-twin/skill-graph")
    public List<SkillGraphDto> getSkillGraph(
            @RequestParam Long userId) {

        return digitalTwinService.getSkillGraph(userId);
    }
}
