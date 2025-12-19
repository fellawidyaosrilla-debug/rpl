/*
  Warnings:

  - Added the required column `judul` to the `Notifikasi` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notifikasi` ADD COLUMN `judul` VARCHAR(191) NOT NULL;
