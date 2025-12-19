/*
  Warnings:

  - The values [DISETUJUI] on the enum `Klaim_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `klaim` MODIFY `status` ENUM('PENDING', 'DITERIMA', 'DITOLAK') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `notifikasi` ADD COLUMN `id_klaim` INTEGER NULL,
    MODIFY `pesan` TEXT NOT NULL;
