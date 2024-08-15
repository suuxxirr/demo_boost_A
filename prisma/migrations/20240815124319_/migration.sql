/*
  Warnings:

  - You are about to drop the column `badgeCount` on the `badges` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `badges` DROP COLUMN `badgeCount`;

-- AlterTable
ALTER TABLE `group` ADD COLUMN `badgeCount` INTEGER NOT NULL DEFAULT 0;
