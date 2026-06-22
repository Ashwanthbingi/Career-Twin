package com.twinos.career.service;

import com.twinos.career.config.StorageProperties;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class ResumeStorageService {

    private final Path resumeRoot;

    public ResumeStorageService(StorageProperties storageProperties) {
        this.resumeRoot = Paths.get(storageProperties.getResumeDir()).toAbsolutePath().normalize();
    }

    public String store(Long userId, byte[] content, String filename) {
        try {
            Path userDir = resumeRoot.resolve(String.valueOf(userId));
            Files.createDirectories(userDir);

            String safeName = sanitizeFilename(filename);
            Path target = userDir.resolve(safeName);
            Files.write(target, content);
            return target.toString();
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to store resume on disk: " + ex.getMessage(), ex);
        }
    }

    public void deleteIfExists(String storagePath) {
        if (storagePath == null || storagePath.isBlank()) {
            return;
        }

        try {
            Path path = Paths.get(storagePath).normalize();
            if (path.startsWith(resumeRoot) && Files.exists(path)) {
                Files.delete(path);
            }
        } catch (IOException ex) {
            throw new IllegalStateException("Failed to delete stored resume: " + ex.getMessage(), ex);
        }
    }

    private String sanitizeFilename(String filename) {
        String value = filename == null ? "resume.pdf" : filename.trim();
        if (value.isBlank()) {
            return "resume.pdf";
        }
        return value.replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
