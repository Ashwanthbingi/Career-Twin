package com.twinos.career.controller;

import com.twinos.career.dto.DigitalTwinResponse;
import com.twinos.career.service.DigitalTwinService;
import org.springframework.web.bind.annotation.*;

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
}