package com.twinos.career.config;

import com.twinos.career.entity.JobRole;
import com.twinos.career.entity.RoleSkill;
import com.twinos.career.entity.Skill;
import com.twinos.career.entity.User;
import com.twinos.career.repository.JobRoleRepository;
import com.twinos.career.repository.RoleSkillRepository;
import com.twinos.career.repository.SkillRepository;
import com.twinos.career.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Configuration
public class DataSeeder {

    private static final String CAREER_ROLES_CSV = "datasets/career_roles.csv";

    @Bean
    CommandLineRunner seedData(
            SkillRepository skillRepository,
            UserRepository userRepository,
            JobRoleRepository jobRoleRepository,
            RoleSkillRepository roleSkillRepository
    ) {
        return args -> {
            seedUsers(userRepository);

            if (skillRepository.count() > 0 && jobRoleRepository.count() > 0 && roleSkillRepository.count() > 0) {
                return;
            }

            RoleDataset roleDataset = loadRoleDataset();
            Map<String, Skill> skills = seedSkills(skillRepository, roleDataset.skills());
            seedJobRoles(jobRoleRepository, roleSkillRepository, skills, roleDataset.roleDescriptions(), roleDataset.roleSkills());
        };
    }

    private RoleDataset loadRoleDataset() {
        ClassPathResource resource = new ClassPathResource(CAREER_ROLES_CSV);
        if (!resource.exists()) {
            throw new IllegalStateException("Career role dataset not found: " + CAREER_ROLES_CSV);
        }

        Map<String, String> roleDescriptions = new LinkedHashMap<>();
        Map<String, String> skillCategories = new LinkedHashMap<>();
        Map<String, String> skillKeywords = new LinkedHashMap<>();
        List<RoleSkillSeed> roleSkills = new ArrayList<>();

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(
                resource.getInputStream(),
                StandardCharsets.UTF_8
        ))) {
            String line = reader.readLine();
            while ((line = reader.readLine()) != null) {
                List<String> values = parseCsvLine(line);
                if (values.size() < 5) {
                    continue;
                }

                String roleTitle = values.get(0).trim();
                String roleDescription = values.get(1).trim();
                String skillName = values.get(2).trim();
                String skillCategory = values.get(3).trim();
                String keywords = values.get(4).trim();

                roleDescriptions.putIfAbsent(roleTitle, roleDescription);
                skillCategories.putIfAbsent(skillName, skillCategory);
                skillKeywords.putIfAbsent(skillName, keywords);
                roleSkills.add(new RoleSkillSeed(roleTitle, skillName));
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to load career role dataset: " + CAREER_ROLES_CSV, ex);
        }

        List<SkillSeed> skills = skillCategories.keySet().stream()
                .map(name -> new SkillSeed(name, skillCategories.get(name), skillKeywords.getOrDefault(name, "")))
                .toList();

        return new RoleDataset(
                skills,
                roleDescriptions,
                roleSkills
        );
    }

    private Map<String, Skill> seedSkills(SkillRepository skillRepository, List<SkillSeed> seeds) {
        Map<String, Skill> skills = new LinkedHashMap<>();
        for (SkillSeed seed : seeds) {
            Skill skill = skillRepository.findByNameIgnoreCase(seed.name())
                    .orElseGet(() -> {
                        Skill created = new Skill();
                        created.setName(seed.name());
                        created.setCategory(seed.category());
                        created.setKeywords(seed.keywords());
                        return skillRepository.save(created);
                    });
            skills.put(seed.name(), skill);
        }
        return skills;
    }

    private void seedUsers(UserRepository userRepository) {
        if (userRepository.count() == 0) {
            User demoUser = new User();
            demoUser.setName("Demo User");
            demoUser.setEmail("demo@twinos.app");
            userRepository.save(demoUser);
        }
    }

    private void seedJobRoles(
            JobRoleRepository jobRoleRepository,
            RoleSkillRepository roleSkillRepository,
            Map<String, Skill> skills,
            Map<String, String> roleDescriptions,
            List<RoleSkillSeed> roleSkillSeeds
    ) {
        Map<String, JobRole> roles = new LinkedHashMap<>();
        for (RoleSkillSeed seed : roleSkillSeeds) {
            roles.putIfAbsent(seed.roleTitle(), jobRoleRepository.findByTitleIgnoreCase(seed.roleTitle())
                    .orElseGet(() -> {
                        JobRole role = new JobRole();
                        role.setTitle(seed.roleTitle());
                        role.setDescription(roleDescriptions.getOrDefault(seed.roleTitle(), ""));
                        return jobRoleRepository.save(role);
                    }));
        }

        for (RoleSkillSeed seed : roleSkillSeeds) {
            JobRole role = roles.get(seed.roleTitle());
            Skill skill = skills.get(seed.skillName());
            if (role == null || skill == null) {
                continue;
            }

            if (roleSkillRepository.findByRoleIdAndSkillId(role.getId(), skill.getId()).isEmpty()) {
                RoleSkill roleSkill = new RoleSkill();
                roleSkill.setRole(role);
                roleSkill.setSkill(skill);
                roleSkillRepository.save(roleSkill);
            }
        }
    }

    private List<String> parseCsvLine(String line) {
        List<String> values = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;

        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
                continue;
            }

            if (c == ',' && !inQuotes) {
                values.add(current.toString().trim());
                current.setLength(0);
                continue;
            }

            current.append(c);
        }

        values.add(current.toString().trim());
        return values;
    }

    private record RoleDataset(List<SkillSeed> skills, Map<String, String> roleDescriptions, List<RoleSkillSeed> roleSkills) {
    }

    private record SkillSeed(String name, String category, String keywords) {
        String normalized() {
            return normalize(name);
        }

        private String normalize(String value) {
            return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
        }
    }

    private record RoleSkillSeed(String roleTitle, String skillName) {
    }
}
