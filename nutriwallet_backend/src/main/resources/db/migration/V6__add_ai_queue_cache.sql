ALTER TABLE ai_analysis_logs ADD COLUMN retry_count INT NOT NULL DEFAULT 0;
ALTER TABLE ai_analysis_logs ADD COLUMN source VARCHAR(20) NULL;
ALTER TABLE ai_analysis_logs ADD COLUMN cache_key VARCHAR(64) NULL;
ALTER TABLE ai_analysis_logs ADD COLUMN food_name VARCHAR(255) NULL;
ALTER TABLE ai_analysis_logs ADD COLUMN started_at TIMESTAMP(6) NULL;
ALTER TABLE ai_analysis_logs ADD COLUMN completed_at TIMESTAMP(6) NULL;
CREATE INDEX idx_ai_analysis_logs_cache_key ON ai_analysis_logs(cache_key);

CREATE TABLE nutrition_analysis_cache (
 id BIGINT NOT NULL AUTO_INCREMENT, cache_key VARCHAR(64) NOT NULL,
 normalized_food_name VARCHAR(255) NULL, food_name VARCHAR(255) NULL,
 calories DECIMAL(10,2) NOT NULL, protein_gram DECIMAL(10,2) NOT NULL,
 carb_gram DECIMAL(10,2) NOT NULL, fat_gram DECIMAL(10,2) NOT NULL,
 model_name VARCHAR(100) NULL, use_count BIGINT NOT NULL DEFAULT 0,
 created_at TIMESTAMP(6) NOT NULL, updated_at TIMESTAMP(6) NOT NULL,
 PRIMARY KEY (id), UNIQUE KEY uk_nutrition_cache_key (cache_key),
 KEY idx_nutrition_cache_updated_at (updated_at)
);
