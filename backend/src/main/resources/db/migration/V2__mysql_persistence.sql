-- MySQL persistence layer (no twin_snapshots)
-- Run manually if not using spring.jpa.hibernate.ddl-auto=update

CREATE TABLE IF NOT EXISTS resumes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    content_type VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    sha256_hash CHAR(64) NOT NULL,
    storage_path VARCHAR(512) NOT NULL,
    extracted_text TEXT NOT NULL,
    active TINYINT(1) NOT NULL DEFAULT 1,
    uploaded_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_resumes_user UNIQUE (user_id),
    CONSTRAINT fk_resumes_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS github_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    github_username VARCHAR(255) NOT NULL,
    repositories INT NOT NULL,
    stars INT NOT NULL,
    contribution_score INT NOT NULL,
    recommended_role VARCHAR(255) NOT NULL,
    languages_json TEXT NOT NULL,
    detected_skills_json TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_github_profiles_user UNIQUE (user_id),
    CONSTRAINT fk_github_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS leetcode_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    username VARCHAR(255) NOT NULL,
    total_solved INT NOT NULL,
    easy_solved INT NOT NULL,
    medium_solved INT NOT NULL,
    hard_solved INT NOT NULL,
    contest_rating INT NOT NULL,
    ranking INT NOT NULL,
    problem_solving_score INT NOT NULL,
    service_readiness INT NOT NULL,
    product_readiness INT NOT NULL,
    faang_readiness INT NOT NULL,
    topic_scores_json TEXT NOT NULL,
    strengths_json TEXT NOT NULL,
    weaknesses_json TEXT NOT NULL,
    timeline_json TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_leetcode_profiles_user UNIQUE (user_id),
    CONSTRAINT fk_leetcode_profiles_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS skill_validations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    skill_name VARCHAR(255) NOT NULL,
    source VARCHAR(32) NOT NULL,
    evidence TEXT NOT NULL,
    confidence_score INT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    CONSTRAINT uk_skill_validations_user_skill_source UNIQUE (user_id, skill_name, source),
    CONSTRAINT fk_skill_validations_user FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX idx_skill_validations_user ON skill_validations (user_id);
