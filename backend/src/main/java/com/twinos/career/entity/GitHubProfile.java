package com.twinos.career.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.Instant;

@Entity
@Table(
        name = "github_profiles",
        uniqueConstraints = @UniqueConstraint(columnNames = "user_id")
)
public class GitHubProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "github_username", nullable = false)
    private String githubUsername;

    @Column(nullable = false)
    private int repositories;

    @Column(nullable = false)
    private int stars;

    @Column(name = "contribution_score", nullable = false)
    private int contributionScore;

    @Column(name = "recommended_role", nullable = false)
    private String recommendedRole;

    @Column(name = "languages_json", nullable = false, columnDefinition = "TEXT")
    private String languagesJson;

    @Column(name = "detected_skills_json", nullable = false, columnDefinition = "TEXT")
    private String detectedSkillsJson;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    @PreUpdate
    void touchUpdatedAt() {
        updatedAt = Instant.now();
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public String getGithubUsername() {
        return githubUsername;
    }

    public void setGithubUsername(String githubUsername) {
        this.githubUsername = githubUsername;
    }

    public int getRepositories() {
        return repositories;
    }

    public void setRepositories(int repositories) {
        this.repositories = repositories;
    }

    public int getStars() {
        return stars;
    }

    public void setStars(int stars) {
        this.stars = stars;
    }

    public int getContributionScore() {
        return contributionScore;
    }

    public void setContributionScore(int contributionScore) {
        this.contributionScore = contributionScore;
    }

    public String getRecommendedRole() {
        return recommendedRole;
    }

    public void setRecommendedRole(String recommendedRole) {
        this.recommendedRole = recommendedRole;
    }

    public String getLanguagesJson() {
        return languagesJson;
    }

    public void setLanguagesJson(String languagesJson) {
        this.languagesJson = languagesJson;
    }

    public String getDetectedSkillsJson() {
        return detectedSkillsJson;
    }

    public void setDetectedSkillsJson(String detectedSkillsJson) {
        this.detectedSkillsJson = detectedSkillsJson;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
