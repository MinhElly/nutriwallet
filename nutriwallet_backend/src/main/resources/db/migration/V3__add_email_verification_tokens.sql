ALTER TABLE users
  MODIFY COLUMN status enum('PENDING_VERIFICATION','ACTIVE','BLOCKED') COLLATE utf8mb4_unicode_ci NOT NULL AFTER role;

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id bigint NOT NULL AUTO_INCREMENT,
  user_id bigint NOT NULL,
  token varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  expires_at datetime(6) NOT NULL,
  verified_at datetime(6) DEFAULT NULL,
  created_at datetime(6) NOT NULL,
  updated_at datetime(6) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email_verification_tokens_token (token),
  KEY idx_email_verification_tokens_user_id (user_id),
  CONSTRAINT fk_email_verification_tokens_user
    FOREIGN KEY (user_id) REFERENCES users (id)
);
