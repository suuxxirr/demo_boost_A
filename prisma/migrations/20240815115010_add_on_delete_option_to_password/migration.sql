-- DropForeignKey
ALTER TABLE `badges` DROP FOREIGN KEY `Badges_groupId_fkey`;

-- AddForeignKey
ALTER TABLE `Badges` ADD CONSTRAINT `Badges_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
