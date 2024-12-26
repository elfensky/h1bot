/*
  Warnings:

  - A unique constraint covering the columns `[event_id]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[message_id]` on the table `Event` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[message_id]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `last_updated` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_updated` to the `Post` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Event` ADD COLUMN `last_updated` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Post` ADD COLUMN `last_updated` DATETIME(3) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Event_event_id_key` ON `Event`(`event_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Event_message_id_key` ON `Event`(`message_id`);

-- CreateIndex
CREATE UNIQUE INDEX `Post_message_id_key` ON `Post`(`message_id`);
