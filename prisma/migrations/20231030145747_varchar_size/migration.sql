-- AlterTable
ALTER TABLE `Doubt` MODIFY `message` VARCHAR(5000) NOT NULL;

-- AlterTable
ALTER TABLE `Event` MODIFY `title` VARCHAR(5000) NOT NULL;

-- AlterTable
ALTER TABLE `Task` MODIFY `title` VARCHAR(5000) NOT NULL,
    MODIFY `description` VARCHAR(5000) NOT NULL;

-- AlterTable
ALTER TABLE `UserTask` MODIFY `content` VARCHAR(5000) NOT NULL;
