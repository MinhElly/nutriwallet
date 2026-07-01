ALTER TABLE users
  MODIFY COLUMN provider enum('FACEBOOK','LOCAL','GOOGLE') COLLATE utf8mb4_unicode_ci NOT NULL;
