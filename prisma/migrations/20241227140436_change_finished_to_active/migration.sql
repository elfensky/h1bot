/*
  Warnings:

  - You are about to drop the column `finished` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `finished` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `finished`,
    ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `finished`,
    ADD COLUMN `active` BOOLEAN NOT NULL DEFAULT true;
