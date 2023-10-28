/*
  Warnings:

  - You are about to drop the column `deliveredDate` on the `Task` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `Doubt` ADD COLUMN `userTaskId` INTEGER NULL;

-- AlterTable
ALTER TABLE `Task` DROP COLUMN `deliveredDate`;

-- CreateTable
CREATE TABLE `UserTask` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `taskId` INTEGER NOT NULL,
    `deliveredAt` DATETIME(3) NOT NULL,
    `content` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `UserTask` ADD CONSTRAINT `UserTask_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `UserTask` ADD CONSTRAINT `UserTask_taskId_fkey` FOREIGN KEY (`taskId`) REFERENCES `Task`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Doubt` ADD CONSTRAINT `Doubt_userTaskId_fkey` FOREIGN KEY (`userTaskId`) REFERENCES `UserTask`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
