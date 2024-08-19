-- DropForeignKey
ALTER TABLE `password` DROP FOREIGN KEY `Password_groupId_fkey`;

-- AddForeignKey
ALTER TABLE `Password` ADD CONSTRAINT `Password_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
