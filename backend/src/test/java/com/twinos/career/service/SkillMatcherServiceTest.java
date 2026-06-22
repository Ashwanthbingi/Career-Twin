package com.twinos.career.service;

import com.twinos.career.entity.Skill;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class SkillMatcherServiceTest {

    @Autowired
    private SkillMatcherService skillMatcherService;

    @Test
    void matchesSkillsByNameAndKeywords() {
        String resumeText = """
                Experienced engineer with tensorflow and data analysis background.
                Built models using scikit-learn for production workloads.
                Strong Java and SQL experience across distributed systems.
                """;

        List<Skill> matched = skillMatcherService.matchSkillsInText(resumeText);

        assertThat(matched).extracting(Skill::getName)
                .contains("Machine Learning", "Data Analysis", "Java", "SQL");
    }
}
