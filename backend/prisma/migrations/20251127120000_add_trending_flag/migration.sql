ALTER TABLE `news` ADD COLUMN `trending` BOOLEAN NOT NULL DEFAULT false;
CREATE INDEX `news_trending_idx` ON `news` (`trending`);

