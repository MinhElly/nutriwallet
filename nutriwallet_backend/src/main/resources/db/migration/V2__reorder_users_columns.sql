ALTER TABLE users
  MODIFY COLUMN id bigint NOT NULL AUTO_INCREMENT FIRST,
  MODIFY COLUMN full_name varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL AFTER id,
  MODIFY COLUMN password_hash varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER full_name,
  MODIFY COLUMN email varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL AFTER password_hash,
  MODIFY COLUMN avatar_url varchar(1024) COLLATE utf8mb4_unicode_ci DEFAULT NULL AFTER email,
  MODIFY COLUMN provider enum('FACEBOOK','LOCAL') COLLATE utf8mb4_unicode_ci NOT NULL AFTER avatar_url,
  MODIFY COLUMN role enum('ADMIN','USER') COLLATE utf8mb4_unicode_ci NOT NULL AFTER provider,
  MODIFY COLUMN status enum('ACTIVE','BLOCKED') COLLATE utf8mb4_unicode_ci NOT NULL AFTER role,
  MODIFY COLUMN deleted_at datetime(6) DEFAULT NULL AFTER status,
  MODIFY COLUMN created_at datetime(6) NOT NULL AFTER deleted_at,
  MODIFY COLUMN updated_at datetime(6) NOT NULL AFTER created_at;