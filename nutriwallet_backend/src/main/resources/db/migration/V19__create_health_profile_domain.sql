CREATE TABLE health_profiles (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    consent_given BOOLEAN NOT NULL DEFAULT FALSE,
    food_restrictions TEXT NULL,
    first_completed_at TIMESTAMP(6) NULL,
    last_reviewed_at TIMESTAMP(6) NULL,
    next_quarterly_review_at TIMESTAMP(6) NULL,
    next_annual_review_at TIMESTAMP(6) NULL,
    profile_version BIGINT NOT NULL DEFAULT 0,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_health_profiles_user UNIQUE (user_id),
    CONSTRAINT fk_health_profiles_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_health_profiles_quarterly (next_quarterly_review_at),
    INDEX idx_health_profiles_annual (next_annual_review_at)
);

CREATE TABLE health_profile_conditions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    health_profile_id BIGINT NOT NULL,
    condition_type VARCHAR(40) NOT NULL,
    custom_value VARCHAR(255) NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_health_condition_profile FOREIGN KEY (health_profile_id) REFERENCES health_profiles(id) ON DELETE CASCADE,
    CONSTRAINT uk_health_condition_type UNIQUE (health_profile_id, condition_type)
);

CREATE TABLE health_profile_allergies (
    id BIGINT NOT NULL AUTO_INCREMENT,
    health_profile_id BIGINT NOT NULL,
    allergen_type VARCHAR(40) NOT NULL,
    custom_value VARCHAR(255) NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_health_allergy_profile FOREIGN KEY (health_profile_id) REFERENCES health_profiles(id) ON DELETE CASCADE,
    CONSTRAINT uk_health_allergy_type UNIQUE (health_profile_id, allergen_type)
);

CREATE TABLE health_classifications (
    id BIGINT NOT NULL AUTO_INCREMENT,
    health_profile_id BIGINT NOT NULL,
    primary_type VARCHAR(40) NOT NULL,
    risk_flags_json TEXT NOT NULL,
    explanations_json TEXT NOT NULL,
    rule_version INT NOT NULL,
    evaluated_at TIMESTAMP(6) NOT NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT uk_health_classification_profile UNIQUE (health_profile_id),
    CONSTRAINT fk_health_classification_profile FOREIGN KEY (health_profile_id) REFERENCES health_profiles(id) ON DELETE CASCADE
);

CREATE TABLE health_assessment_sessions (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NOT NULL,
    channel VARCHAR(20) NOT NULL,
    assessment_type VARCHAR(20) NOT NULL,
    current_step VARCHAR(50) NOT NULL,
    draft_json TEXT NOT NULL,
    status VARCHAR(20) NOT NULL,
    version BIGINT NOT NULL DEFAULT 0,
    expires_at TIMESTAMP(6) NOT NULL,
    completed_at TIMESTAMP(6) NULL,
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    CONSTRAINT fk_health_assessment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_health_assessment_user_status (user_id, status),
    INDEX idx_health_assessment_expiry (status, expires_at)
);
