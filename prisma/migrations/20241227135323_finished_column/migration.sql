-- AlterTable
ALTER TABLE `Event` ADD COLUMN `finished` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `finished` BOOLEAN NOT NULL DEFAULT false;
