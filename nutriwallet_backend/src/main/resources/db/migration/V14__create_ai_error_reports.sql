CREATE TABLE IF NOT EXISTS ai_error_reports (
    id BIGINT NOT NULL AUTO_INCREMENT,
    user_id BIGINT NULL,
    meal_record_id BIGINT NULL,
    ai_analysis_log_id BIGINT NULL,
    reason VARCHAR(255) NOT NULL,
    description TEXT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP(6) NOT NULL,
    updated_at TIMESTAMP(6) NOT NULL,
    PRIMARY KEY (id),
    INDEX idx_ai_error_reports_user (user_id),
    INDEX idx_ai_error_reports_meal (meal_record_id),
    INDEX idx_ai_error_reports_analysis (ai_analysis_log_id),
    INDEX idx_ai_error_reports_status_created (status, created_at),
    CONSTRAINT fk_ai_error_reports_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_ai_error_reports_meal
        FOREIGN KEY (meal_record_id) REFERENCES meal_records(id) ON DELETE SET NULL,
    CONSTRAINT fk_ai_error_reports_analysis
        FOREIGN KEY (ai_analysis_log_id) REFERENCES ai_analysis_logs(id) ON DELETE SET NULL
);
