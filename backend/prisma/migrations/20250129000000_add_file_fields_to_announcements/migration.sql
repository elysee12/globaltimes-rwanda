-- Add file fields to announcements table
-- Check and add file column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'announcements'
  AND COLUMN_NAME = 'file';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `announcements` ADD COLUMN `file` VARCHAR(191) NULL',
  'SELECT "Column file already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add fileName column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'announcements'
  AND COLUMN_NAME = 'fileName';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `announcements` ADD COLUMN `fileName` VARCHAR(191) NULL',
  'SELECT "Column fileName already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Check and add fileType column if it doesn't exist
SET @col_exists = 0;
SELECT COUNT(*) INTO @col_exists
FROM information_schema.COLUMNS
WHERE TABLE_SCHEMA = DATABASE()
  AND TABLE_NAME = 'announcements'
  AND COLUMN_NAME = 'fileType';

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE `announcements` ADD COLUMN `fileType` VARCHAR(191) NULL',
  'SELECT "Column fileType already exists" AS message');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

