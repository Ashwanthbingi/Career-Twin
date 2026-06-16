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
        name = "leetcode_profiles",
        uniqueConstraints = @UniqueConstraint(columnNames = "user_id")
)
public class LeetCodeProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String username;

    @Column(name = "total_solved", nullable = false)
    private int totalSolved;

    @Column(name = "easy_solved", nullable = false)
    private int easySolved;

    @Column(name = "medium_solved", nullable = false)
    private int mediumSolved;

    @Column(name = "hard_solved", nullable = false)
    private int hardSolved;

    @Column(name = "contest_rating", nullable = false)
    private int contestRating;

    @Column(nullable = false)
    private int ranking;

    @Column(name = "problem_solving_score", nullable = false)
    private int problemSolvingScore;

    @Column(name = "service_readiness", nullable = false)
    private int serviceReadiness;

    @Column(name = "product_readiness", nullable = false)
    private int productReadiness;

    @Column(name = "faang_readiness", nullable = false)
    private int faangReadiness;

    @Column(name = "topic_scores_json", nullable = false, columnDefinition = "TEXT")
    private String topicScoresJson;

    @Column(name = "strengths_json", nullable = false, columnDefinition = "TEXT")
    private String strengthsJson;

    @Column(name = "weaknesses_json", nullable = false, columnDefinition = "TEXT")
    private String weaknessesJson;

    @Column(name = "timeline_json", nullable = false, columnDefinition = "TEXT")
    private String timelineJson;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void prePersist() {
        if (updatedAt == null) {
            updatedAt = Instant.now();
        }
    }

    @PreUpdate
    void preUpdate() {
        updatedAt = Instant.now();
    }

    public Long getId() { return id; }
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public int getTotalSolved() { return totalSolved; }
    public void setTotalSolved(int totalSolved) { this.totalSolved = totalSolved; }
    public int getEasySolved() { return easySolved; }
    public void setEasySolved(int easySolved) { this.easySolved = easySolved; }
    public int getMediumSolved() { return mediumSolved; }
    public void setMediumSolved(int mediumSolved) { this.mediumSolved = mediumSolved; }
    public int getHardSolved() { return hardSolved; }
    public void setHardSolved(int hardSolved) { this.hardSolved = hardSolved; }
    public int getContestRating() { return contestRating; }
    public void setContestRating(int contestRating) { this.contestRating = contestRating; }
    public int getRanking() { return ranking; }
    public void setRanking(int ranking) { this.ranking = ranking; }
    public int getProblemSolvingScore() { return problemSolvingScore; }
    public void setProblemSolvingScore(int problemSolvingScore) { this.problemSolvingScore = problemSolvingScore; }
    public int getServiceReadiness() { return serviceReadiness; }
    public void setServiceReadiness(int serviceReadiness) { this.serviceReadiness = serviceReadiness; }
    public int getProductReadiness() { return productReadiness; }
    public void setProductReadiness(int productReadiness) { this.productReadiness = productReadiness; }
    public int getFaangReadiness() { return faangReadiness; }
    public void setFaangReadiness(int faangReadiness) { this.faangReadiness = faangReadiness; }
    public String getTopicScoresJson() { return topicScoresJson; }
    public void setTopicScoresJson(String topicScoresJson) { this.topicScoresJson = topicScoresJson; }
    public String getStrengthsJson() { return strengthsJson; }
    public void setStrengthsJson(String strengthsJson) { this.strengthsJson = strengthsJson; }
    public String getWeaknessesJson() { return weaknessesJson; }
    public void setWeaknessesJson(String weaknessesJson) { this.weaknessesJson = weaknessesJson; }
    public String getTimelineJson() { return timelineJson; }
    public void setTimelineJson(String timelineJson) { this.timelineJson = timelineJson; }
    public Instant getUpdatedAt() { return updatedAt; }
}
