/*
  Warnings:

  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `createdAt` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `id` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `whatsapp` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `claim` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `founditem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `notification` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[username]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `id_user` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `username` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `claim` DROP FOREIGN KEY `Claim_claimantId_fkey`;

-- DropForeignKey
ALTER TABLE `claim` DROP FOREIGN KEY `Claim_foundItemId_fkey`;

-- DropForeignKey
ALTER TABLE `founditem` DROP FOREIGN KEY `FoundItem_finderId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `Notification_userId_fkey`;

-- DropIndex
DROP INDEX `User_email_key` ON `user`;

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `createdAt`,
    DROP COLUMN `email`,
    DROP COLUMN `id`,
    DROP COLUMN `name`,
    DROP COLUMN `whatsapp`,
    ADD COLUMN `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `id_user` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `username` VARCHAR(191) NOT NULL,
    MODIFY `role` ENUM('ADMIN', 'USER') NOT NULL DEFAULT 'USER',
    ADD PRIMARY KEY (`id_user`);

-- DropTable
DROP TABLE `claim`;

-- DropTable
DROP TABLE `founditem`;

-- DropTable
DROP TABLE `notification`;

-- CreateTable
CREATE TABLE `Pelapor` (
    `id_pelapor` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_lengkap` VARCHAR(191) NOT NULL,
    `no_hp` VARCHAR(20) NOT NULL,
    `alamat` TEXT NULL,
    `foto_profil` VARCHAR(191) NULL,
    `id_user` INTEGER NOT NULL,

    UNIQUE INDEX `Pelapor_id_user_key`(`id_user`),
    PRIMARY KEY (`id_pelapor`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Kategori` (
    `id_kategori` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_kategori` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id_kategori`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Barang` (
    `id_barang` INTEGER NOT NULL AUTO_INCREMENT,
    `nama_barang` VARCHAR(191) NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `tgl_ditemukan` DATETIME(3) NOT NULL,
    `lokasi_detail` VARCHAR(191) NOT NULL,
    `foto_barang` VARCHAR(191) NULL,
    `id_kategori` INTEGER NOT NULL,

    PRIMARY KEY (`id_barang`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Laporan` (
    `id_laporan` INTEGER NOT NULL AUTO_INCREMENT,
    `jenis_laporan` ENUM('KEHILANGAN', 'PENEMUAN') NOT NULL,
    `status` ENUM('MENUNGGU_VERIFIKASI', 'DIPUBLIKASIKAN', 'DIKLAIM', 'SELESAI', 'DITOLAK') NOT NULL DEFAULT 'MENUNGGU_VERIFIKASI',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_pelapor` INTEGER NOT NULL,
    `id_barang` INTEGER NOT NULL,

    UNIQUE INDEX `Laporan_id_barang_key`(`id_barang`),
    PRIMARY KEY (`id_laporan`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Klaim` (
    `id_klaim` INTEGER NOT NULL AUTO_INCREMENT,
    `bukti_kepemilikan` TEXT NOT NULL,
    `status` ENUM('PENDING', 'DISETUJUI', 'DITOLAK') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_laporan` INTEGER NOT NULL,
    `id_pemilik_klaim` INTEGER NOT NULL,

    PRIMARY KEY (`id_klaim`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Notifikasi` (
    `id_notifikasi` INTEGER NOT NULL AUTO_INCREMENT,
    `pesan` VARCHAR(191) NOT NULL,
    `is_read` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `id_user` INTEGER NOT NULL,

    PRIMARY KEY (`id_notifikasi`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `User_username_key` ON `User`(`username`);

-- AddForeignKey
ALTER TABLE `Pelapor` ADD CONSTRAINT `Pelapor_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barang` ADD CONSTRAINT `Barang_id_kategori_fkey` FOREIGN KEY (`id_kategori`) REFERENCES `Kategori`(`id_kategori`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Laporan` ADD CONSTRAINT `Laporan_id_pelapor_fkey` FOREIGN KEY (`id_pelapor`) REFERENCES `Pelapor`(`id_pelapor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Laporan` ADD CONSTRAINT `Laporan_id_barang_fkey` FOREIGN KEY (`id_barang`) REFERENCES `Barang`(`id_barang`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Klaim` ADD CONSTRAINT `Klaim_id_laporan_fkey` FOREIGN KEY (`id_laporan`) REFERENCES `Laporan`(`id_laporan`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Klaim` ADD CONSTRAINT `Klaim_id_pemilik_klaim_fkey` FOREIGN KEY (`id_pemilik_klaim`) REFERENCES `Pelapor`(`id_pelapor`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifikasi` ADD CONSTRAINT `Notifikasi_id_user_fkey` FOREIGN KEY (`id_user`) REFERENCES `User`(`id_user`) ON DELETE RESTRICT ON UPDATE CASCADE;
