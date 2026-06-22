package com.twinos.career.repository;

import com.twinos.career.entity.Resume;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {

    Optional<Resume> findByUserIdAndActiveTrue(Long userId);
}
