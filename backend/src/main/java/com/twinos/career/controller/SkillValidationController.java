package com.twinos.career.controller;

import com.twinos.career.dto.SkillConfidenceSummaryResponse;
import com.twinos.career.dto.ValidatedSkillResponse;
import com.twinos.career.service.SkillValidationService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api")
public class SkillValidationController {

    private final SkillValidationService skillValidationService;

    public SkillValidationController(SkillValidationService skillValidationService) {
        this.skillValidationService = skillValidationService;
    }

    @GetMapping("/skills/validated")
    public List<ValidatedSkillResponse> getValidatedSkills(@RequestParam Long userId) {
        return skillValidationService.getValidatedSkills(userId);
    }

    @GetMapping("/skill-validations")
    public List<ValidatedSkillResponse> getSkillValidations(@RequestParam Long userId) {
        return skillValidationService.getValidatedSkills(userId);
    }

    @GetMapping("/skills/confidence-summary")
    public SkillConfidenceSummaryResponse getConfidenceSummary(@RequestParam Long userId) {
        return skillValidationService.getConfidenceSummary(userId);
    }
}
