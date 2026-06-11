package com.twinos.career.controller;

import com.twinos.career.dto.SkillGapResponse;
import com.twinos.career.service.SkillGapService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/skill-gap")
public class SkillGapController {

    private final SkillGapService skillGapService;

    public SkillGapController(SkillGapService skillGapService) {
        this.skillGapService = skillGapService;
    }

    @GetMapping
    public SkillGapResponse getSkillGap(
            @RequestParam Long userId,
            @RequestParam Long targetRoleId
    ) {
        return skillGapService.analyzeSkillGap(userId, targetRoleId);
    }
}
