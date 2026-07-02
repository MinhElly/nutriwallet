-- Add meal_type and estimated_price_vnd fields to AI analysis log and cache
ALTER TABLE ai_analysis_logs ADD COLUMN meal_type VARCHAR(20) NULL;
ALTER TABLE ai_analysis_logs ADD COLUMN estimated_price_vnd DECIMAL(12,0) NULL;

ALTER TABLE nutrition_analysis_cache ADD COLUMN meal_type VARCHAR(20) NULL;
ALTER TABLE nutrition_analysis_cache ADD COLUMN estimated_price_vnd DECIMAL(12,0) NULL;
