/*
  Warnings:

  - You are about to drop the column `userTaskId` on the `Doubt` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Doubt` DROP FOREIGN KEY `Doubt_userTaskId_fkey`;

-- AlterTable
ALTER TABLE `Doubt` DROP COLUMN `userTaskId`;
