package com.twinos.career.repository;

import com.twinos.career.entity.LeetCodeProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface LeetCodeProfileRepository extends JpaRepository<LeetCodeProfile, Long> {
    Optional<LeetCodeProfile> findByUserId(Long userId);
}
