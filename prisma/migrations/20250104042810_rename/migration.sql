/*
  Warnings:

  - You are about to drop the `Attack` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Defend` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Post` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `Attack`;

-- DropTable
DROP TABLE `Defend`;

-- DropTable
DROP TABLE `Post`;

-- CreateTable
CREATE TABLE `defend_posts` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` INTEGER NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `message_created` DATETIME(3) NOT NULL,
    `message_updated` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `defend_posts_event_id_key`(`event_id`),
    UNIQUE INDEX `defend_posts_message_id_key`(`message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attack_posts` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` INTEGER NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `message_created` DATETIME(3) NOT NULL,
    `message_updated` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `attack_posts_event_id_key`(`event_id`),
    UNIQUE INDEX `attack_posts_message_id_key`(`message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `daily_posts` (
    `id` VARCHAR(191) NOT NULL,
    `start_time` INTEGER NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `message_created` DATETIME(3) NOT NULL,
    `message_updated` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `daily_posts_message_id_key`(`message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
