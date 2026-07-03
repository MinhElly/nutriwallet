ALTER TABLE user_settings
    ADD COLUMN ai_recommendations_enabled BOOLEAN NOT NULL DEFAULT TRUE AFTER auto_create_expense;
