package com.twinos.career.controller;

import com.twinos.career.dto.GitHubAnalysisRequest;
import com.twinos.career.dto.GitHubAnalysisResponse;
import com.twinos.career.dto.GitHubProfileResponse;
import com.twinos.career.service.GitHubAnalyzerService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/github")
@CrossOrigin(origins = "*")
public class GitHubController {

    private final GitHubAnalyzerService gitHubAnalyzerService;

    public GitHubController(GitHubAnalyzerService gitHubAnalyzerService) {
        this.gitHubAnalyzerService = gitHubAnalyzerService;
    }

    @PostMapping("/analyze")
    public GitHubAnalysisResponse analyze(@Valid @RequestBody GitHubAnalysisRequest request) {
        return gitHubAnalyzerService.analyze(request);
    }

    @GetMapping("/profile")
    public GitHubProfileResponse getProfile(@RequestParam Long userId) {
        return gitHubAnalyzerService.getProfile(userId);
    }
}
