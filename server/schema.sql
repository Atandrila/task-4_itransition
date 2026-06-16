CREATE DATABASE IF NOT EXISTS task5_user_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE task5_user_management;

CREATE TABLE IF NOT EXISTS users (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  public_id CHAR(36) NOT NULL,

  name VARCHAR(120) NOT NULL,
  email VARCHAR(254) NOT NULL,

  email_key VARCHAR(254) GENERATED ALWAYS AS (LOWER(TRIM(email))) STORED,

  password_hash VARCHAR(255) NOT NULL,

  status ENUM('unverified', 'active', 'blocked') NOT NULL DEFAULT 'unverified',

  email_verification_token CHAR(64) NULL,
  email_verified_at DATETIME NULL,

  last_login_at DATETIME NULL,
  last_activity_at DATETIME NULL,

  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (id),

  UNIQUE INDEX uq_users_email (email_key),
  UNIQUE INDEX uq_users_public_id (public_id),
  UNIQUE INDEX uq_users_verify_token (email_verification_token)
);