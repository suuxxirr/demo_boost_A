/*
  Warnings:

  - You are about to drop the column `badges` on the `group` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `group` DROP COLUMN `badges`;

-- CreateTable
CREATE TABLE `Badges` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `badge` VARCHAR(191) NOT NULL,
    `groupId` INTEGER NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Badges` ADD CONSTRAINT `Badges_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
