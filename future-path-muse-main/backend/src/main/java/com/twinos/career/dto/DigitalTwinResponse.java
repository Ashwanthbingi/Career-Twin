package com.twinos.career.dto;

public class DigitalTwinResponse {

    private String name;
    private int readinessScore;
    private int skillsCount;
    private int projectsCount;
    private String topCareer;

    public DigitalTwinResponse(
            String name,
            int readinessScore,
            int skillsCount,
            int projectsCount,
            String topCareer) {

        this.name = name;
        this.readinessScore = readinessScore;
        this.skillsCount = skillsCount;
        this.projectsCount = projectsCount;
        this.topCareer = topCareer;
    }

    public String getName() {
        return name;
    }

    public int getReadinessScore() {
        return readinessScore;
    }

    public int getSkillsCount() {
        return skillsCount;
    }

    public int getProjectsCount() {
        return projectsCount;
    }

    public String getTopCareer() {
        return topCareer;
    }
}