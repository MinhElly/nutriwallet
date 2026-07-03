-- Add evaluation_status field to AI analysis log
ALTER TABLE ai_analysis_logs ADD COLUMN evaluation_status VARCHAR(20) NOT NULL DEFAULT 'PENDING';
