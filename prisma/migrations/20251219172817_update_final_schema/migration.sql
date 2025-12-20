/*
  Warnings:

  - You are about to drop the column `id_klaim` on the `notifikasi` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `notifikasi` DROP COLUMN `id_klaim`,
    ADD COLUMN `id_laporan` INTEGER NULL,
    ADD COLUMN `tipe` ENUM('INFO', 'MATCH', 'CLAIM') NOT NULL DEFAULT 'INFO';

-- AddForeignKey
ALTER TABLE `Notifikasi` ADD CONSTRAINT `Notifikasi_id_laporan_fkey` FOREIGN KEY (`id_laporan`) REFERENCES `Laporan`(`id_laporan`) ON DELETE SET NULL ON UPDATE CASCADE;
