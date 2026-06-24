-- Migration: add slug column to news table
-- The slug is a SEO-friendly URL identifier generated from the English title.
-- We first add the column as nullable, back-fill existing rows with a slug
-- derived from their id (safe default), then make it NOT NULL + UNIQUE.

-- Step 1: add nullable slug column
ALTER TABLE `news` ADD COLUMN `slug` VARCHAR(255) NULL;

-- Step 2: back-fill existing rows — use id-based slug so nothing breaks
UPDATE `news` SET `slug` = CONCAT('article-', `id`) WHERE `slug` IS NULL;

-- Step 3: make the column NOT NULL and add the unique constraint
ALTER TABLE `news` MODIFY COLUMN `slug` VARCHAR(255) NOT NULL;
ALTER TABLE `news` ADD UNIQUE INDEX `news_slug_key`(`slug`);

-- Step 4: add a regular index for fast slug lookups
CREATE INDEX `news_slug_idx` ON `news`(`slug`);
