-- CreateTable
CREATE TABLE IF NOT EXISTS `announcements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titleEN` VARCHAR(191) NOT NULL,
    `titleRW` VARCHAR(191) NOT NULL,
    `titleFR` VARCHAR(191) NOT NULL,
    `descriptionEN` TEXT NOT NULL,
    `descriptionRW` TEXT NOT NULL,
    `descriptionFR` TEXT NOT NULL,
    `image` VARCHAR(191) NULL,
    `video` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `announcements_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

