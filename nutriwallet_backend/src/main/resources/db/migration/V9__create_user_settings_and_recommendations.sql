CREATE TABLE user_settings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    gender VARCHAR(20),
    weight DOUBLE,
    height DOUBLE,
    goal VARCHAR(255),
    age INT,
    diet VARCHAR(100),
    activity_level VARCHAR(50),
    monthly_budget DECIMAL(19, 2) DEFAULT 0.0,
    language VARCHAR(10) DEFAULT 'vi',
    email_analysis_ready BOOLEAN DEFAULT TRUE,
    budget_warning_push BOOLEAN DEFAULT TRUE,
    auto_create_expense BOOLEAN DEFAULT FALSE,
    theme VARCHAR(20) DEFAULT 'light',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE ai_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    tone VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ai_recommendations_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

ALTER TABLE ai_analysis_logs ADD COLUMN confidence DECIMAL(5, 2) NULL;
