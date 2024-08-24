/*
  Warnings:

  - Made the column `description` on table `badges` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `badges` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `badges` MODIFY `description` VARCHAR(191) NOT NULL,
    MODIFY `name` VARCHAR(191) NOT NULL;
