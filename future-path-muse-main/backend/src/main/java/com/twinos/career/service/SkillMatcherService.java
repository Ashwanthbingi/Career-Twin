package com.twinos.career.service;

import com.twinos.career.entity.Skill;
import com.twinos.career.repository.SkillRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Locale;

@Service
public class SkillMatcherService {

    private final SkillRepository skillRepository;

    public SkillMatcherService(SkillRepository skillRepository) {
        this.skillRepository = skillRepository;
    }

    public List<Skill> matchSkillsInText(String text) {
        if (text == null || text.isBlank()) {
            return List.of();
        }

        String normalizedText = text.toLowerCase(Locale.ROOT);
        List<Skill> matched = new ArrayList<>();

        for (Skill skill : skillRepository.findAll()) {
            if (containsSkill(normalizedText, skill)) {
                matched.add(skill);
            }
        }

        return matched;
    }

    private boolean containsSkill(String normalizedText, Skill skill) {
        if (containsTerm(normalizedText, skill.getName())) {
            return true;
        }

        if (skill.getKeywords() == null || skill.getKeywords().isBlank()) {
            return false;
        }

        return Arrays.stream(skill.getKeywords().split(","))
                .map(String::trim)
                .filter(keyword -> !keyword.isEmpty())
                .anyMatch(keyword -> containsTerm(normalizedText, keyword));
    }

    private boolean containsTerm(String normalizedText, String term) {
        String normalizedTerm = term.toLowerCase(Locale.ROOT).trim();
        if (normalizedTerm.isEmpty()) {
            return false;
        }
        return normalizedText.contains(normalizedTerm);
    }
}
