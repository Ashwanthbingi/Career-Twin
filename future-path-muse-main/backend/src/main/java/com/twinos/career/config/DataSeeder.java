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

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedData(
            SkillRepository skillRepository,
            UserRepository userRepository,
            JobRoleRepository jobRoleRepository,
            RoleSkillRepository roleSkillRepository
    ) {
        return args -> {
            if (skillRepository.count() > 0) {
                return;
            }

            Map<String, Skill> skills = seedSkills(skillRepository);
            seedUsers(userRepository);
            seedJobRoles(jobRoleRepository, roleSkillRepository, skills);
        };
    }

    private Map<String, Skill> seedSkills(SkillRepository skillRepository) {
        List<SkillSeed> seeds = List.of(
                new SkillSeed("Java", "Technical", "java,spring,hibernate"),
                new SkillSeed("Python", "Technical", "python,django,flask"),
                new SkillSeed("JavaScript", "Technical", "javascript,typescript,node.js,react"),
                new SkillSeed("SQL", "Data", "sql,postgresql,mysql,queries"),
                new SkillSeed("Machine Learning", "Data", "machine learning,ml,scikit-learn,tensorflow"),
                new SkillSeed("Data Analysis", "Data", "data analysis,analytics,excel,pandas"),
                new SkillSeed("Systems Design", "Technical", "systems design,architecture,microservices"),
                new SkillSeed("Product Strategy", "Leadership", "product strategy,roadmap,product management"),
                new SkillSeed("Engineering Leadership", "Leadership", "engineering leadership,team lead,mentoring"),
                new SkillSeed("Negotiation", "Communication", "negotiation,deal-making"),
                new SkillSeed("Public Speaking", "Communication", "public speaking,presentations,keynote"),
                new SkillSeed("Project Management", "Leadership", "project management,agile,scrum,jira"),
                new SkillSeed("Cloud Computing", "Technical", "cloud computing,aws,azure,gcp"),
                new SkillSeed("DevOps", "Technical", "devops,ci/cd,docker,kubernetes"),
                new SkillSeed("UI/UX Design", "Technical", "ui/ux,figma,wireframes,prototyping")
        );

        Map<String, Skill> skills = new LinkedHashMap<>();
        for (SkillSeed seed : seeds) {
            Skill skill = new Skill();
            skill.setName(seed.name());
            skill.setCategory(seed.category());
            skill.setKeywords(seed.keywords());
            skills.put(seed.name(), skillRepository.save(skill));
        }
        return skills;
    }

    private void seedUsers(UserRepository userRepository) {
        User demoUser = new User();
        demoUser.setName("Demo User");
        demoUser.setEmail("demo@twinos.app");
        userRepository.save(demoUser);
    }

    private void seedJobRoles(
            JobRoleRepository jobRoleRepository,
            RoleSkillRepository roleSkillRepository,
            Map<String, Skill> skills
    ) {
        createRole(jobRoleRepository, roleSkillRepository, skills,
                "Software Engineer",
                "Builds and maintains software applications across the stack.",
                List.of("Java", "JavaScript", "SQL", "Systems Design", "DevOps"));

        createRole(jobRoleRepository, roleSkillRepository, skills,
                "Data Scientist",
                "Analyzes data and builds predictive models to drive decisions.",
                List.of("Python", "SQL", "Machine Learning", "Data Analysis", "Public Speaking"));

        createRole(jobRoleRepository, roleSkillRepository, skills,
                "Product Manager",
                "Defines product vision and coordinates cross-functional delivery.",
                List.of("Product Strategy", "Project Management", "Negotiation", "Public Speaking", "Data Analysis"));

        createRole(jobRoleRepository, roleSkillRepository, skills,
                "Engineering Manager",
                "Leads engineering teams and drives technical execution.",
                List.of("Engineering Leadership", "Systems Design", "Project Management", "Negotiation", "Java"));

        createRole(jobRoleRepository, roleSkillRepository, skills,
                "Cloud Architect",
                "Designs scalable cloud infrastructure and platform solutions.",
                List.of("Cloud Computing", "Systems Design", "DevOps", "Java", "SQL"));

        createRole(jobRoleRepository, roleSkillRepository, skills,
                "UX Designer",
                "Designs intuitive user experiences and interaction flows.",
                List.of("UI/UX Design", "Public Speaking", "Product Strategy", "JavaScript", "Data Analysis"));
    }

    private void createRole(
            JobRoleRepository jobRoleRepository,
            RoleSkillRepository roleSkillRepository,
            Map<String, Skill> skills,
            String title,
            String description,
            List<String> requiredSkillNames
    ) {
        JobRole role = new JobRole();
        role.setTitle(title);
        role.setDescription(description);
        role = jobRoleRepository.save(role);

        for (String skillName : requiredSkillNames) {
            Skill skill = skills.get(skillName);
            if (skill == null) {
                continue;
            }

            RoleSkill roleSkill = new RoleSkill();
            roleSkill.setRole(role);
            roleSkill.setSkill(skill);
            roleSkillRepository.save(roleSkill);
        }
    }

    private record SkillSeed(String name, String category, String keywords) {
    }
}
