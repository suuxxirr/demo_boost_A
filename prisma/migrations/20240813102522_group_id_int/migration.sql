/*
  Warnings:

  - The primary key for the `group` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `group` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.
  - You are about to alter the column `groupId` on the `password` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Int`.

*/
-- DropForeignKey
ALTER TABLE `password` DROP FOREIGN KEY `Password_groupId_fkey`;

-- AlterTable
ALTER TABLE `group` DROP PRIMARY KEY,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `password` MODIFY `groupId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Password` ADD CONSTRAINT `Password_groupId_fkey` FOREIGN KEY (`groupId`) REFERENCES `Group`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
