UPDATE user_settings
SET ai_recommendations_enabled = TRUE
WHERE ai_recommendations_enabled IS NULL;

ALTER TABLE user_settings
    MODIFY COLUMN ai_recommendations_enabled BOOLEAN NOT NULL DEFAULT TRUE;
