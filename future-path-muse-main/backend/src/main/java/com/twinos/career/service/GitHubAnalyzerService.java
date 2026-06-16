package com.twinos.career.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.twinos.career.dto.GitHubAnalysisRequest;
import com.twinos.career.dto.GitHubAnalysisResponse;
import com.twinos.career.dto.GitHubProfileResponse;
import com.twinos.career.entity.GitHubProfile;
import com.twinos.career.entity.Skill;
import com.twinos.career.entity.User;
import com.twinos.career.entity.UserSkill;
import com.twinos.career.exception.ResourceNotFoundException;
import com.twinos.career.repository.GitHubProfileRepository;
import com.twinos.career.repository.SkillRepository;
import com.twinos.career.repository.UserRepository;
import com.twinos.career.repository.UserSkillRepository;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@Service
public class GitHubAnalyzerService {

    private static final String GITHUB_API_VERSION = "2022-11-28";
    private static final String GITHUB_SKILL_SOURCE = "github";

    private static final Map<String, String> TECHNOLOGY_ALIASES = Map.ofEntries(
            Map.entry("spring", "Spring Boot"),
            Map.entry("spring boot", "Spring Boot"),
            Map.entry("springboot", "Spring Boot"),
            Map.entry("react", "React"),
            Map.entry("reactjs", "React"),
            Map.entry("rest", "REST API"),
            Map.entry("rest api", "REST API"),
            Map.entry("api", "REST API"),
            Map.entry("docker", "Docker"),
            Map.entry("kubernetes", "Kubernetes"),
            Map.entry("k8s", "Kubernetes"),
            Map.entry("aws", "AWS"),
            Map.entry("typescript", "TypeScript"),
            Map.entry("javascript", "JavaScript"),
            Map.entry("java", "Java"),
            Map.entry("python", "Python"),
            Map.entry("sql", "SQL"),
            Map.entry("postgres", "SQL"),
            Map.entry("postgresql", "SQL"),
            Map.entry("machine learning", "Machine Learning"),
            Map.entry("ml", "Machine Learning")
    );

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final UserSkillRepository userSkillRepository;
    private final GitHubProfileRepository gitHubProfileRepository;
    private final DigitalTwinService digitalTwinService;
    private final ObjectMapper objectMapper;
    private final RestClient gitHubClient;

    public GitHubAnalyzerService(
            UserRepository userRepository,
            SkillRepository skillRepository,
            UserSkillRepository userSkillRepository,
            GitHubProfileRepository gitHubProfileRepository,
            DigitalTwinService digitalTwinService,
            ObjectMapper objectMapper,
            RestClient.Builder restClientBuilder
    ) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.userSkillRepository = userSkillRepository;
        this.gitHubProfileRepository = gitHubProfileRepository;
        this.digitalTwinService = digitalTwinService;
        this.objectMapper = objectMapper;
        this.gitHubClient = restClientBuilder
                .baseUrl("https://api.github.com")
                .defaultHeader(HttpHeaders.ACCEPT, "application/vnd.github+json")
                .defaultHeader("X-GitHub-Api-Version", GITHUB_API_VERSION)
                .defaultHeader(HttpHeaders.USER_AGENT, "Twinos-GitHub-Portfolio-Analyzer")
                .build();
    }

    @Transactional
    public GitHubAnalysisResponse analyze(GitHubAnalysisRequest request) {
        User user = userRepository.findById(request.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + request.userId()));

        String username = request.githubUsername().trim();
        if (username.isBlank()) {
            throw new IllegalArgumentException("GitHub username is required");
        }

        List<GitHubRepository> repositories = fetchPublicRepositories(username);
        RepositorySignals signals = analyzeRepositorySignals(repositories);
        List<Skill> detectedSkills = upsertDetectedSkills(signals.detectedSkills());
        linkSkillsToUser(user, detectedSkills);

        int contributionScore = calculateContributionScore(
                repositories.size(),
                signals.totalStars(),
                detectedSkills.size()
        );
        String recommendedRole = digitalTwinService.buildTwin(user.getId()).topCareer();

        persistProfile(
                user,
                username,
                repositories.size(),
                signals.totalStars(),
                contributionScore,
                recommendedRole,
                signals.languages(),
                detectedSkills.stream().map(Skill::getName).toList()
        );

        return new GitHubAnalysisResponse(
                repositories.size(),
                signals.totalStars(),
                signals.languages(),
                detectedSkills.stream().map(Skill::getName).toList(),
                contributionScore,
                recommendedRole
        );
    }

    public GitHubProfileResponse getProfile(Long userId) {
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found: " + userId);
        }

        GitHubProfile profile = gitHubProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("GitHub profile not found for user: " + userId));

        return new GitHubProfileResponse(
                profile.getUser().getId(),
                profile.getGithubUsername(),
                profile.getRepositories(),
                profile.getStars(),
                profile.getContributionScore(),
                profile.getRecommendedRole(),
                readStringList(profile.getLanguagesJson()),
                readStringList(profile.getDetectedSkillsJson()),
                DateTimeFormatter.ISO_INSTANT.format(profile.getUpdatedAt())
        );
    }

    private void persistProfile(
            User user,
            String username,
            int repositories,
            int stars,
            int contributionScore,
            String recommendedRole,
            List<String> languages,
            List<String> detectedSkills
    ) {
        GitHubProfile profile = gitHubProfileRepository.findByUserId(user.getId())
                .orElseGet(GitHubProfile::new);
        profile.setUser(user);
        profile.setGithubUsername(username);
        profile.setRepositories(repositories);
        profile.setStars(stars);
        profile.setContributionScore(contributionScore);
        profile.setRecommendedRole(recommendedRole);
        profile.setLanguagesJson(writeJson(languages));
        profile.setDetectedSkillsJson(writeJson(detectedSkills));
        gitHubProfileRepository.save(profile);
    }

    private String writeJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize GitHub profile", ex);
        }
    }

    private List<String> readStringList(String json) {
        try {
            return objectMapper.readValue(
                    json,
                    objectMapper.getTypeFactory().constructCollectionType(List.class, String.class)
            );
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to deserialize GitHub profile", ex);
        }
    }

    private List<GitHubRepository> fetchPublicRepositories(String username) {
        try {
            List<GitHubRepository> repositories = gitHubClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/users/{username}/repos")
                            .queryParam("type", "owner")
                            .queryParam("sort", "updated")
                            .queryParam("per_page", "100")
                            .build(username))
                    .retrieve()
                    .body(new ParameterizedTypeReference<>() {
                    });

            return repositories == null ? List.of() : repositories;
        } catch (RestClientResponseException ex) {
            if (ex.getStatusCode().value() == 404) {
                throw new ResourceNotFoundException("GitHub user not found: " + username);
            }
            throw new IllegalArgumentException("GitHub analysis failed: " + ex.getStatusText());
        }
    }

    private RepositorySignals analyzeRepositorySignals(List<GitHubRepository> repositories) {
        Set<String> languages = new LinkedHashSet<>();
        Set<String> detectedSkills = new LinkedHashSet<>();
        int totalStars = 0;

        for (GitHubRepository repository : repositories) {
            if (repository.language() != null && !repository.language().isBlank()) {
                languages.add(repository.language());
                detectedSkills.add(resolveTechnology(repository.language()));
            }

            totalStars += Math.max(0, repository.stargazersCount());

            for (String topic : repository.topics()) {
                String technology = resolveTechnology(topic);
                if (technology != null) {
                    detectedSkills.add(technology);
                }
            }

            detectedSkills.addAll(detectTechnologiesFromText(repository.description()));
            detectedSkills.addAll(detectTechnologiesFromText(repository.name()));
        }

        return new RepositorySignals(
                totalStars,
                languages.stream().limit(8).toList(),
                detectedSkills.stream()
                        .filter(skill -> skill != null && !skill.isBlank())
                        .limit(12)
                        .toList()
        );
    }

    private List<Skill> upsertDetectedSkills(List<String> skillNames) {
        List<Skill> skills = new ArrayList<>();

        for (String skillName : skillNames) {
            Skill skill = skillRepository.findByNameIgnoreCase(skillName)
                    .orElseGet(() -> {
                        Skill created = new Skill();
                        created.setName(skillName);
                        created.setCategory(categoryFor(skillName));
                        created.setKeywords(skillName.toLowerCase(Locale.ROOT));
                        return skillRepository.save(created);
                    });
            skills.add(skill);
        }

        return skills;
    }

    private void linkSkillsToUser(User user, List<Skill> skills) {
        for (Skill skill : skills) {
            Optional<UserSkill> existing = userSkillRepository.findByUserIdAndSkillId(user.getId(), skill.getId());
            if (existing.isPresent()) {
                UserSkill userSkill = existing.get();
                userSkill.setSource(mergeSource(userSkill.getSource(), GITHUB_SKILL_SOURCE));
                userSkillRepository.save(userSkill);
                continue;
            }

            UserSkill userSkill = new UserSkill();
            userSkill.setUser(user);
            userSkill.setSkill(skill);
            userSkill.setSource(GITHUB_SKILL_SOURCE);
            userSkillRepository.save(userSkill);
        }
    }

    private List<String> detectTechnologiesFromText(String value) {
        if (value == null || value.isBlank()) {
            return List.of();
        }

        String normalized = normalize(value);
        Set<String> matches = new LinkedHashSet<>();

        for (Map.Entry<String, String> entry : TECHNOLOGY_ALIASES.entrySet()) {
            if (normalized.contains(entry.getKey())) {
                matches.add(entry.getValue());
            }
        }

        return matches.stream().toList();
    }

    private String resolveTechnology(String rawValue) {
        if (rawValue == null || rawValue.isBlank()) {
            return null;
        }

        String normalized = normalize(rawValue);
        return TECHNOLOGY_ALIASES.getOrDefault(normalized, titleCase(rawValue));
    }

    private String normalize(String value) {
        return value.trim()
                .toLowerCase(Locale.ROOT)
                .replace("-", " ")
                .replace("_", " ");
    }

    private String titleCase(String value) {
        String normalized = value.trim().replace("-", " ").replace("_", " ");
        if (normalized.equalsIgnoreCase("typescript")) {
            return "TypeScript";
        }

        String[] words = normalized.split("\\s+");
        List<String> titled = new ArrayList<>();
        for (String word : words) {
            if (word.isBlank()) {
                continue;
            }
            titled.add(word.substring(0, 1).toUpperCase(Locale.ROOT)
                    + word.substring(1).toLowerCase(Locale.ROOT));
        }
        return String.join(" ", titled);
    }

    private String categoryFor(String skillName) {
        String normalized = normalize(skillName);
        if (normalized.contains("sql") || normalized.contains("machine learning") || normalized.equals("python")) {
            return "Data";
        }
        return "Technical";
    }

    private int calculateContributionScore(int repositoryCount, int totalStars, int detectedSkillCount) {
        return Math.min(100, (repositoryCount * 3) + Math.min(35, totalStars / 2) + (detectedSkillCount * 5));
    }

    private String mergeSource(String current, String source) {
        if (current == null || current.isBlank()) {
            return source;
        }

        List<String> sources = List.of(current.split(","));
        if (sources.stream().anyMatch(source::equalsIgnoreCase)) {
            return current;
        }

        return current + "," + source;
    }

    private record RepositorySignals(int totalStars, List<String> languages, List<String> detectedSkills) {
    }

    private record GitHubRepository(
            String name,
            String description,
            String language,
            List<String> topics,
            @com.fasterxml.jackson.annotation.JsonProperty("stargazers_count") int stargazersCount
    ) {
        public GitHubRepository {
            topics = topics == null ? List.of() : topics;
        }
    }
}
