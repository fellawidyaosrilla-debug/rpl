/*
  Warnings:

  - The values [DITERIMA,DITOLAK] on the enum `Klaim_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `klaim` ADD COLUMN `id_barang` INTEGER NULL,
    ADD COLUMN `id_penemu` INTEGER NULL,
    ADD COLUMN `id_pengklaim` INTEGER NULL,
    MODIFY `status` ENUM('PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `notifikasi` ADD COLUMN `id_from_user` INTEGER NULL,
    ADD COLUMN `id_klaim` INTEGER NULL,
    MODIFY `tipe` ENUM('INFO', 'MATCH', 'REQUEST', 'APPROVED', 'CLAIM') NOT NULL DEFAULT 'INFO';

-- AddForeignKey
ALTER TABLE `Klaim` ADD CONSTRAINT `Klaim_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `Barang`(`id_barang`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Klaim` ADD CONSTRAINT `Klaim_id_pengklaim_fkey` FOREIGN KEY (`id_pengklaim`) REFERENCES `User`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Klaim` ADD CONSTRAINT `Klaim_id_penemu_fkey` FOREIGN KEY (`id_penemu`) REFERENCES `User`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifikasi` ADD CONSTRAINT `Notifikasi_id_from_user_fkey` FOREIGN KEY (`id_from_user`) REFERENCES `User`(`id_user`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifikasi` ADD CONSTRAINT `Notifikasi_id_klaim_fkey` FOREIGN KEY (`id_klaim`) REFERENCES `Klaim`(`id_klaim`) ON DELETE SET NULL ON UPDATE CASCADE;
