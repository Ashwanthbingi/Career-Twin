package com.twinos.career.controller;

import com.twinos.career.dto.rag.*;
import com.twinos.career.service.RagService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rag")
@CrossOrigin(origins = "*")
public class RagController {

    private final RagService ragService;

    public RagController(RagService ragService) {
        this.ragService = ragService;
    }

    @PostMapping("/resume-analysis")
    public RagResumeAnalysisResponse analyzeResume(@RequestParam Long userId) {
        return ragService.analyzeResume(userId);
    }

    @PostMapping("/github-analysis")
    public RagGitHubAnalysisResponse analyzeGitHub(@RequestParam Long userId) {
        return ragService.analyzeGitHub(userId);
    }

    @PostMapping("/leetcode-analysis")
    public RagLeetCodeAnalysisResponse analyzeLeetCode(@RequestParam Long userId) {
        return ragService.analyzeLeetCode(userId);
    }

    @PostMapping("/career-recommendation")
    public RagCareerRecommendationResponse getCareerRecommendations(@RequestParam Long userId) {
        return ragService.getCareerRecommendations(userId);
    }

    @PostMapping("/skill-validation")
    public RagSkillValidationResponse validateSkill(
            @RequestParam Long userId,
            @RequestParam String skillName
    ) {
        return ragService.validateSkill(userId, skillName);
    }

    @PostMapping("/roadmap")
    public RagRoadmapResponse generateRoadmap(
            @RequestParam Long userId,
            @RequestParam String targetRole
    ) {
        return ragService.generateRoadmap(userId, targetRole);
    }
}
