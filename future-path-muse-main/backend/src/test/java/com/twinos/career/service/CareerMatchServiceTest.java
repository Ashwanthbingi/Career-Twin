package com.twinos.career.service;

import com.twinos.career.dto.CareerMatchDto;
import com.twinos.career.entity.Skill;
import com.twinos.career.entity.User;
import com.twinos.career.entity.UserSkill;
import com.twinos.career.repository.SkillRepository;
import com.twinos.career.repository.UserRepository;
import com.twinos.career.repository.UserSkillRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
@Transactional
class CareerMatchServiceTest {

    @Autowired
    private CareerMatchService careerMatchService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private UserSkillRepository userSkillRepository;

    private User user;

    @BeforeEach
    void setUp() {
        user = userRepository.findAll().stream()
                .filter(existing -> "demo@twinos.app".equals(existing.getEmail()))
                .findFirst()
                .orElseThrow();

        userSkillRepository.deleteAll();

        Skill java = skillRepository.findAll().stream()
                .filter(skill -> "Java".equals(skill.getName()))
                .findFirst()
                .orElseThrow();
        Skill sql = skillRepository.findAll().stream()
                .filter(skill -> "SQL".equals(skill.getName()))
                .findFirst()
                .orElseThrow();

        saveUserSkill(user, java);
        saveUserSkill(user, sql);
    }

    @Test
    void calculatesMatchScoreAndRanksCareers() {
        List<CareerMatchDto> matches = careerMatchService.getCareerMatches(user.getId());

        assertThat(matches).isNotEmpty();
        assertThat(matches.get(0).matchScore()).isGreaterThanOrEqualTo(matches.get(1).matchScore());

        CareerMatchDto engineerMatch = matches.stream()
                .filter(match -> "Software Engineer".equals(match.title()))
                .findFirst()
                .orElseThrow();

        assertThat(engineerMatch.matchScore()).isEqualTo(40);
        assertThat(engineerMatch.matchedSkills()).isEqualTo(2);
        assertThat(engineerMatch.requiredSkills()).isEqualTo(5);
    }

    private void saveUserSkill(User user, Skill skill) {
        UserSkill userSkill = new UserSkill();
        userSkill.setUser(user);
        userSkill.setSkill(skill);
        userSkill.setSource("test");
        userSkillRepository.save(userSkill);
    }
}
