package com.twinos.career.repository;

import com.twinos.career.entity.GitHubProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface GitHubProfileRepository extends JpaRepository<GitHubProfile, Long> {

    Optional<GitHubProfile> findByUserId(Long userId);
}
