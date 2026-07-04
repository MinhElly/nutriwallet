-- Repair environments where ai_error_reports was created before V14 with required relations.
-- User-submitted reports may reference only an AI analysis log, and system reports have no meal record.
ALTER TABLE ai_error_reports
    MODIFY COLUMN user_id BIGINT NULL,
    MODIFY COLUMN meal_record_id BIGINT NULL,
    MODIFY COLUMN ai_analysis_log_id BIGINT NULL;