-- Add email field to admins table (if it doesn't exist)
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'admins'
  AND COLUMN_NAME = 'email';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `admins` ADD COLUMN `email` VARCHAR(191) NULL',
  'SELECT "Column email already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create unique index on email (if it doesn't exist)
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'admins'
  AND INDEX_NAME = 'admins_email_key';

SET @sql = IF(@index_exists = 0,
  'CREATE UNIQUE INDEX `admins_email_key` ON `admins`(`email`)',
  'SELECT "Index admins_email_key already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Create password_resets table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS `password_resets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create indexes on password_resets (if they don't exist)
SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'password_resets'
  AND INDEX_NAME = 'password_resets_token_key';

SET @sql = IF(@index_exists = 0,
  'CREATE UNIQUE INDEX `password_resets_token_key` ON `password_resets`(`token`)',
  'SELECT "Index password_resets_token_key already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'password_resets'
  AND INDEX_NAME = 'password_resets_username_idx';

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX `password_resets_username_idx` ON `password_resets`(`username`)',
  'SELECT "Index password_resets_username_idx already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'password_resets'
  AND INDEX_NAME = 'password_resets_token_idx';

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX `password_resets_token_idx` ON `password_resets`(`token`)',
  'SELECT "Index password_resets_token_idx already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = 0;
SELECT COUNT(*) INTO @index_exists
FROM information_schema.STATISTICS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'password_resets'
  AND INDEX_NAME = 'password_resets_expiresAt_idx';

SET @sql = IF(@index_exists = 0,
  'CREATE INDEX `password_resets_expiresAt_idx` ON `password_resets`(`expiresAt`)',
  'SELECT "Index password_resets_expiresAt_idx already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

