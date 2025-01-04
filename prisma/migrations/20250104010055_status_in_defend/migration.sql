/*
  Warnings:

  - You are about to drop the column `active` on the `Defend` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Attack` ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active';

-- AlterTable
ALTER TABLE `Defend` DROP COLUMN `active`,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'active';
