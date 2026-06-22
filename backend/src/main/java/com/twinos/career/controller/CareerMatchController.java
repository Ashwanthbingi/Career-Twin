package com.twinos.career.controller;

import com.twinos.career.dto.CareerMatchDto;
import com.twinos.career.service.DigitalTwinService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/career-match")
public class CareerMatchController {

    private final DigitalTwinService digitalTwinService;

    public CareerMatchController(DigitalTwinService digitalTwinService) {
        this.digitalTwinService = digitalTwinService;
    }

    @GetMapping
    public List<CareerMatchDto> getCareerMatches(@RequestParam Long userId) {
        return digitalTwinService.getCareerMatches(userId);
    }
}
