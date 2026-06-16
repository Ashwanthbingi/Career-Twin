package com.twinos.career.repository;

import com.twinos.career.entity.SkillEvidenceSource;
import com.twinos.career.entity.SkillValidation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SkillValidationRepository extends JpaRepository<SkillValidation, Long> {

    List<SkillValidation> findByUserId(Long userId);

    Optional<SkillValidation> findByUserIdAndSkillNameIgnoreCaseAndSource(
            Long userId,
            String skillName,
            SkillEvidenceSource source
    );
}
