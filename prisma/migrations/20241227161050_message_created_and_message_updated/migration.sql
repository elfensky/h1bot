/*
  Warnings:

  - You are about to drop the column `last_updated` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `last_updated` on the `Post` table. All the data in the column will be lost.
  - Added the required column `message_created` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message_updated` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message_created` to the `Post` table without a default value. This is not possible if the table is not empty.
  - Added the required column `message_updated` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Event` DROP COLUMN `last_updated`,
    ADD COLUMN `message_created` DATETIME(3) NOT NULL,
    ADD COLUMN `message_updated` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Post` DROP COLUMN `last_updated`,
    ADD COLUMN `message_created` DATETIME(3) NOT NULL,
    ADD COLUMN `message_updated` DATETIME(3) NOT NULL;
