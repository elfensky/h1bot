/*
  Warnings:

  - You are about to drop the `attack_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `daily_posts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `defend_posts` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `attack_posts`;

-- DropTable
DROP TABLE `daily_posts`;

-- DropTable
DROP TABLE `defend_posts`;

-- CreateTable
CREATE TABLE `defend` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` INTEGER NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `message_created` DATETIME(3) NOT NULL,
    `message_updated` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `defend_event_id_key`(`event_id`),
    UNIQUE INDEX `defend_message_id_key`(`message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attack` (
    `id` VARCHAR(191) NOT NULL,
    `event_id` INTEGER NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `message_created` DATETIME(3) NOT NULL,
    `message_updated` DATETIME(3) NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'active',
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `attack_event_id_key`(`event_id`),
    UNIQUE INDEX `attack_message_id_key`(`message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `war` (
    `id` VARCHAR(191) NOT NULL,
    `start_time` INTEGER NOT NULL,
    `message_id` VARCHAR(191) NOT NULL,
    `message_created` DATETIME(3) NOT NULL,
    `message_updated` DATETIME(3) NOT NULL,
    `active` BOOLEAN NOT NULL DEFAULT true,

    UNIQUE INDEX `war_message_id_key`(`message_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
