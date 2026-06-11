package com.twinos.career.service;

import com.twinos.career.dto.ResumeUploadResponse;
import com.twinos.career.dto.SkillDto;
import com.twinos.career.entity.Skill;
import com.twinos.career.entity.User;
import com.twinos.career.entity.UserSkill;
import com.twinos.career.exception.ResourceNotFoundException;
import com.twinos.career.repository.UserRepository;
import com.twinos.career.repository.UserSkillRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
public class ResumeService {

    private static final String RESUME_SOURCE = "resume";

    private final UserRepository userRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillMatcherService skillMatcherService;

    public ResumeService(
            UserRepository userRepository,
            UserSkillRepository userSkillRepository,
            SkillMatcherService skillMatcherService
    ) {
        this.userRepository = userRepository;
        this.userSkillRepository = userSkillRepository;
        this.skillMatcherService = skillMatcherService;
    }

    @Transactional
    public ResumeUploadResponse uploadResume(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        validatePdf(file);

        String extractedText = extractText(file);
        List<Skill> detectedSkills = skillMatcherService.matchSkillsInText(extractedText);

        for (Skill skill : detectedSkills) {
            userSkillRepository.findByUserIdAndSkillId(userId, skill.getId())
                    .orElseGet(() -> {
                        UserSkill userSkill = new UserSkill();
                        userSkill.setUser(user);
                        userSkill.setSkill(skill);
                        userSkill.setSource(RESUME_SOURCE);
                        return userSkillRepository.save(userSkill);
                    });
        }

        List<SkillDto> skillDtos = detectedSkills.stream()
                .map(skill -> new SkillDto(skill.getId(), skill.getName(), skill.getCategory()))
                .toList();

        String preview = extractedText.length() > 500
                ? extractedText.substring(0, 500) + "..."
                : extractedText;

        return new ResumeUploadResponse(userId, skillDtos.size(), skillDtos, preview);
    }

    private void validatePdf(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("PDF file is required");
        }

        String contentType = file.getContentType();
        String filename = file.getOriginalFilename();
        boolean isPdf = "application/pdf".equalsIgnoreCase(contentType)
                || (filename != null && filename.toLowerCase().endsWith(".pdf"));

        if (!isPdf) {
            throw new IllegalArgumentException("Only PDF files are accepted");
        }
    }

    private String extractText(MultipartFile file) {
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to extract text from PDF: " + ex.getMessage());
        }
    }
}
