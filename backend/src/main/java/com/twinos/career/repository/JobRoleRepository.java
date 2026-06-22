package com.twinos.career.repository;

import com.twinos.career.entity.JobRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface JobRoleRepository extends JpaRepository<JobRole, Long> {

    Optional<JobRole> findByTitleIgnoreCase(String title);
}
