/*
  Warnings:

  - You are about to drop the column `professorId` on the `Doubt` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Doubt` DROP FOREIGN KEY `Doubt_professorId_fkey`;

-- AlterTable
ALTER TABLE `Doubt` DROP COLUMN `professorId`,
    ADD COLUMN `teacherId` INTEGER NULL,
    ADD COLUMN `userId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Doubt` ADD CONSTRAINT `Doubt_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Doubt` ADD CONSTRAINT `Doubt_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
