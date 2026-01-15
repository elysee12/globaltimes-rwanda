-- CreateTable
CREATE TABLE `admins` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NULL,
    `password` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `admins_username_key`(`username`),
    UNIQUE INDEX `admins_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sessions` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `sessionId` VARCHAR(191) NOT NULL,
    `adminId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `lastActivity` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `ipAddress` VARCHAR(191) NULL,
    `userAgent` VARCHAR(191) NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `sessions_sessionId_key`(`sessionId`),
    INDEX `sessions_sessionId_idx`(`sessionId`),
    INDEX `sessions_adminId_idx`(`adminId`),
    INDEX `sessions_expiresAt_idx`(`expiresAt`),
    INDEX `sessions_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `news` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titleEN` VARCHAR(191) NOT NULL,
    `titleRW` VARCHAR(191) NOT NULL,
    `titleFR` VARCHAR(191) NOT NULL,
    `excerptEN` TEXT NOT NULL,
    `excerptRW` TEXT NOT NULL,
    `excerptFR` TEXT NOT NULL,
    `contentEN` LONGTEXT NOT NULL,
    `contentRW` LONGTEXT NOT NULL,
    `contentFR` LONGTEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `image` VARCHAR(191) NULL,
    `images` JSON NULL,
    `videos` JSON NULL,
    `video` VARCHAR(191) NULL,
    `author` VARCHAR(191) NOT NULL,
    `featured` BOOLEAN NOT NULL DEFAULT false,
    `trending` BOOLEAN NOT NULL DEFAULT false,
    `views` INTEGER NOT NULL DEFAULT 0,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `publishedAt` DATETIME(3) NULL,

    INDEX `news_category_idx`(`category`),
    INDEX `news_featured_idx`(`featured`),
    INDEX `news_trending_idx`(`trending`),
    INDEX `news_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `advertisements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `placement` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `mediaUrl` VARCHAR(191) NULL,
    `linkUrl` VARCHAR(191) NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `advertisements_placement_idx`(`placement`),
    INDEX `advertisements_isPublished_idx`(`isPublished`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `media` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `url` VARCHAR(191) NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `size` INTEGER NULL,
    `mimeType` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `media_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcements` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `titleEN` VARCHAR(191) NOT NULL,
    `titleRW` VARCHAR(191) NOT NULL,
    `titleFR` VARCHAR(191) NOT NULL,
    `descriptionEN` TEXT NOT NULL,
    `descriptionRW` TEXT NOT NULL,
    `descriptionFR` TEXT NOT NULL,
    `image` VARCHAR(191) NULL,
    `video` VARCHAR(191) NULL,
    `file` VARCHAR(191) NULL,
    `fileName` VARCHAR(191) NULL,
    `fileType` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `announcements_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `password_resets` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(191) NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `used` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `password_resets_token_key`(`token`),
    INDEX `password_resets_username_idx`(`username`),
    INDEX `password_resets_token_idx`(`token`),
    INDEX `password_resets_expiresAt_idx`(`expiresAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admins`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
