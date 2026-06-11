package com.twinos.career.controller;

import com.twinos.career.dto.ResumeUploadResponse;
import com.twinos.career.service.ResumeService;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/resume")
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
}
