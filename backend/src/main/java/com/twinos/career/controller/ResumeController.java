package com.twinos.career.controller;

import com.twinos.career.dto.ResumeResponse;
import com.twinos.career.dto.ResumeUploadResponse;
import com.twinos.career.service.ResumeService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
@CrossOrigin(origins = "*")
public class ResumeController {

    private final ResumeService resumeService;

    public ResumeController(ResumeService resumeService) {
        this.resumeService = resumeService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResumeUploadResponse uploadResume(
            @RequestParam("userId") Long userId,
            @RequestParam("file") MultipartFile file
    ) {
        return resumeService.uploadResume(userId, file);
    }

    @PostMapping(value = "/replace", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResumeUploadResponse replaceResume(
            @RequestParam("userId") Long userId,
            @RequestParam("file") MultipartFile file
    ) {
        return resumeService.replaceResume(userId, file);
    }

    @GetMapping
    public ResumeResponse getCurrentResume(@RequestParam Long userId) {
        return resumeService.getCurrentResume(userId);
    }
}
