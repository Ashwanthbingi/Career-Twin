package com.twinos.career.service;

import com.twinos.career.dto.ResumeResponse;
import com.twinos.career.dto.ResumeUploadResponse;
import com.twinos.career.dto.SkillDto;
import com.twinos.career.entity.Resume;
import com.twinos.career.entity.Skill;
import com.twinos.career.entity.User;
import com.twinos.career.entity.UserSkill;
import com.twinos.career.exception.ResourceNotFoundException;
import com.twinos.career.repository.ResumeRepository;
import com.twinos.career.repository.UserRepository;
import com.twinos.career.repository.UserSkillRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Instant;
import java.time.format.DateTimeFormatter;
import java.util.HexFormat;
import java.util.List;
import java.util.Optional;

@Service
public class ResumeService {

    private static final String RESUME_SOURCE = "resume";
    private static final DateTimeFormatter API_DATE_FORMAT = DateTimeFormatter.ISO_INSTANT;

    private final UserRepository userRepository;
    private final ResumeRepository resumeRepository;
    private final UserSkillRepository userSkillRepository;
    private final SkillMatcherService skillMatcherService;
    private final ResumeStorageService resumeStorageService;
    private final DigitalTwinRefreshService digitalTwinRefreshService;

    public ResumeService(
            UserRepository userRepository,
            ResumeRepository resumeRepository,
            UserSkillRepository userSkillRepository,
            SkillMatcherService skillMatcherService,
            ResumeStorageService resumeStorageService,
            DigitalTwinRefreshService digitalTwinRefreshService
    ) {
        this.userRepository = userRepository;
        this.resumeRepository = resumeRepository;
        this.userSkillRepository = userSkillRepository;
        this.skillMatcherService = skillMatcherService;
        this.resumeStorageService = resumeStorageService;
        this.digitalTwinRefreshService = digitalTwinRefreshService;
    }

    @Transactional
    public ResumeUploadResponse replaceResume(Long userId, MultipartFile file) {
        return uploadResume(userId, file);
    }

    @Transactional
    public ResumeUploadResponse uploadResume(Long userId, MultipartFile file) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        validatePdf(file);

        byte[] fileBytes = readBytes(file);
        String extractedText = extractText(fileBytes);
        List<Skill> detectedSkills = skillMatcherService.matchSkillsInText(extractedText);
        linkSkillsToUser(user, detectedSkills);

        Resume resume = resumeRepository.findByUserIdAndActiveTrue(user.getId()).orElseGet(Resume::new);
        if (resume.getStoragePath() != null) {
            resumeStorageService.deleteIfExists(resume.getStoragePath());
        }

        String storagePath = resumeStorageService.store(
                user.getId(),
                fileBytes,
                file.getOriginalFilename()
        );

        Instant now = Instant.now();
        resume.setUser(user);
        resume.setOriginalFilename(file.getOriginalFilename() == null ? "resume.pdf" : file.getOriginalFilename());
        resume.setContentType(file.getContentType() == null ? "application/pdf" : file.getContentType());
        resume.setFileSize(file.getSize());
        resume.setSha256Hash(sha256(fileBytes));
        resume.setStoragePath(storagePath);
        resume.setExtractedText(extractedText);
        resume.setActive(true);
        if (resume.getUploadedAt() == null) {
            resume.setUploadedAt(now);
        }
        resume.setUpdatedAt(now);
        resumeRepository.save(resume);

        List<SkillDto> skillDtos = detectedSkills.stream()
                .map(skill -> new SkillDto(skill.getId(), skill.getName(), skill.getCategory()))
                .toList();

        return new ResumeUploadResponse(
                userId,
                skillDtos.size(),
                skillDtos,
                preview(extractedText),
                digitalTwinRefreshService.refreshAfterResumeUpload(userId)
        );
    }

    @Transactional(readOnly = true)
    public ResumeResponse getCurrentResume(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));

        Resume resume = resumeRepository.findByUserIdAndActiveTrue(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No active resume found for user: " + userId));

        return new ResumeResponse(
                user.getId(),
                resume.getOriginalFilename(),
                resume.getFileSize(),
                resume.getContentType(),
                resume.getStoragePath(),
                API_DATE_FORMAT.format(resume.getUploadedAt()),
                API_DATE_FORMAT.format(resume.getUpdatedAt()),
                userSkillRepository.findByUserId(user.getId()).size(),
                preview(resume.getExtractedText())
        );
    }

    private void linkSkillsToUser(User user, List<Skill> skills) {
        for (Skill skill : skills) {
            Optional<UserSkill> existing = userSkillRepository.findByUserIdAndSkillId(user.getId(), skill.getId());
            if (existing.isPresent()) {
                UserSkill userSkill = existing.get();
                userSkill.setSource(mergeSource(userSkill.getSource(), RESUME_SOURCE));
                userSkillRepository.save(userSkill);
                continue;
            }

            UserSkill userSkill = new UserSkill();
            userSkill.setUser(user);
            userSkill.setSkill(skill);
            userSkill.setSource(RESUME_SOURCE);
            userSkillRepository.save(userSkill);
        }
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

    private String extractText(byte[] fileBytes) {
        try (PDDocument document = Loader.loadPDF(fileBytes)) {
            PDFTextStripper stripper = new PDFTextStripper();
            return stripper.getText(document);
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to extract text from PDF: " + ex.getMessage());
        }
    }

    private String sha256(byte[] bytes) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(bytes));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 digest is not available", ex);
        }
    }

    private byte[] readBytes(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException ex) {
            throw new IllegalArgumentException("Failed to read PDF bytes: " + ex.getMessage());
        }
    }

    private String mergeSource(String current, String source) {
        if (current == null || current.isBlank()) {
            return source;
        }

        List<String> sources = List.of(current.split(","));
        if (sources.stream().anyMatch(source::equalsIgnoreCase)) {
            return current;
        }

        return current + "," + source;
    }

    private String preview(String text) {
        if (text == null || text.isBlank()) {
            return "";
        }

        String normalized = text.replaceAll("\\s+", " ").trim();
        return normalized.length() > 500 ? normalized.substring(0, 500) + "..." : normalized;
    }
}
