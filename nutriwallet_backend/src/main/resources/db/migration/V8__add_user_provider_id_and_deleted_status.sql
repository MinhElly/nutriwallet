ALTER TABLE users
  ADD COLUMN provider_id varchar(255) DEFAULT NULL AFTER provider,
  ADD UNIQUE KEY uq_provider_provider_id (provider, provider_id),
  MODIFY COLUMN status enum('PENDING_VERIFICATION','ACTIVE','BLOCKED','DELETED') COLLATE utf8mb4_unicode_ci NOT NULL AFTER role;
