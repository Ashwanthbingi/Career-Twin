package com.twinos.career.controller;

import com.twinos.career.dto.LeetCodeAnalysisRequest;
import com.twinos.career.dto.LeetCodeIntelligenceResponse;
import com.twinos.career.service.LeetCodeAnalyzerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/leetcode")
public class LeetCodeController {

    private final LeetCodeAnalyzerService leetCodeAnalyzerService;

    public LeetCodeController(LeetCodeAnalyzerService leetCodeAnalyzerService) {
        this.leetCodeAnalyzerService = leetCodeAnalyzerService;
    }

    @PostMapping("/analyze")
    public LeetCodeIntelligenceResponse analyze(@Valid @RequestBody LeetCodeAnalysisRequest request) {
        return leetCodeAnalyzerService.analyze(request);
    }

    @GetMapping("/profile")
    public LeetCodeIntelligenceResponse getProfile(@RequestParam Long userId) {
        return leetCodeAnalyzerService.getProfile(userId);
    }

    @GetMapping("/intelligence")
    public LeetCodeIntelligenceResponse getIntelligence(@RequestParam Long userId) {
        return leetCodeAnalyzerService.getIntelligence(userId);
    }
}
