ALTER TABLE users ADD COLUMN session_token_hash VARCHAR(64) NULL AFTER password_hash;
