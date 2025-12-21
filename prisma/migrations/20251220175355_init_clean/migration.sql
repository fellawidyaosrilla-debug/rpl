/*
  Warnings:

  - The primary key for the `klaim` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `bukti_kepemilikan` on the `klaim` table. All the data in the column will be lost.
  - You are about to drop the column `foto_bukti` on the `klaim` table. All the data in the column will be lost.
  - You are about to drop the column `id_barang` on the `klaim` table. All the data in the column will be lost.
  - You are about to drop the column `id_klaim` on the `klaim` table. All the data in the column will be lost.
  - You are about to drop the column `id_laporan` on the `klaim` table. All the data in the column will be lost.
  - You are about to drop the column `id_pemilik_klaim` on the `klaim` table. All the data in the column will be lost.
  - You are about to drop the column `id_penemu` on the `klaim` table. All the data in the column will be lost.
  - You are about to drop the column `id_pengklaim` on the `klaim` table. All the data in the column will be lost.
  - You are about to drop the column `tgl_hilang` on the `klaim` table. All the data in the column will be lost.
  - The primary key for the `laporan` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_barang` on the `laporan` table. All the data in the column will be lost.
  - You are about to drop the column `id_laporan` on the `laporan` table. All the data in the column will be lost.
  - You are about to drop the column `id_pelapor` on the `laporan` table. All the data in the column will be lost.
  - You are about to drop the column `jenis_laporan` on the `laporan` table. All the data in the column will be lost.
  - The primary key for the `notifikasi` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_from_user` on the `notifikasi` table. All the data in the column will be lost.
  - You are about to drop the column `id_klaim` on the `notifikasi` table. All the data in the column will be lost.
  - You are about to drop the column `id_laporan` on the `notifikasi` table. All the data in the column will be lost.
  - You are about to drop the column `id_notifikasi` on the `notifikasi` table. All the data in the column will be lost.
  - You are about to drop the column `id_user` on the `notifikasi` table. All the data in the column will be lost.
  - You are about to drop the column `tipe` on the `notifikasi` table. All the data in the column will be lost.
  - The primary key for the `user` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id_user` on the `user` table. All the data in the column will be lost.
  - You are about to drop the `barang` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `kategori` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `pelapor` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[no_hp]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `bukti` to the `Klaim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Klaim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `laporan_id` to the `Klaim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Klaim` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Laporan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lokasi` to the `Laporan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama_barang` to the `Laporan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Laporan` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Notifikasi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `Notifikasi` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nama` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `no_hp` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `barang` DROP FOREIGN KEY `Barang_id_kategori_fkey`;

-- DropForeignKey
ALTER TABLE `klaim` DROP FOREIGN KEY `Klaim_id_barang_fkey`;

-- DropForeignKey
ALTER TABLE `klaim` DROP FOREIGN KEY `Klaim_id_laporan_fkey`;

-- DropForeignKey
ALTER TABLE `klaim` DROP FOREIGN KEY `Klaim_id_pemilik_klaim_fkey`;

-- DropForeignKey
ALTER TABLE `klaim` DROP FOREIGN KEY `Klaim_id_penemu_fkey`;

-- DropForeignKey
ALTER TABLE `klaim` DROP FOREIGN KEY `Klaim_id_pengklaim_fkey`;

-- DropForeignKey
ALTER TABLE `laporan` DROP FOREIGN KEY `Laporan_id_barang_fkey`;

-- DropForeignKey
ALTER TABLE `laporan` DROP FOREIGN KEY `Laporan_id_pelapor_fkey`;

-- DropForeignKey
ALTER TABLE `notifikasi` DROP FOREIGN KEY `Notifikasi_id_from_user_fkey`;

-- DropForeignKey
ALTER TABLE `notifikasi` DROP FOREIGN KEY `Notifikasi_id_klaim_fkey`;

-- DropForeignKey
ALTER TABLE `notifikasi` DROP FOREIGN KEY `Notifikasi_id_laporan_fkey`;

-- DropForeignKey
ALTER TABLE `notifikasi` DROP FOREIGN KEY `Notifikasi_id_user_fkey`;

-- DropForeignKey
ALTER TABLE `pelapor` DROP FOREIGN KEY `Pelapor_id_user_fkey`;

-- AlterTable
ALTER TABLE `klaim` DROP PRIMARY KEY,
    DROP COLUMN `bukti_kepemilikan`,
    DROP COLUMN `foto_bukti`,
    DROP COLUMN `id_barang`,
    DROP COLUMN `id_klaim`,
    DROP COLUMN `id_laporan`,
    DROP COLUMN `id_pemilik_klaim`,
    DROP COLUMN `id_penemu`,
    DROP COLUMN `id_pengklaim`,
    DROP COLUMN `tgl_hilang`,
    ADD COLUMN `bukti` VARCHAR(191) NOT NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `laporan_id` INTEGER NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `laporan` DROP PRIMARY KEY,
    DROP COLUMN `id_barang`,
    DROP COLUMN `id_laporan`,
    DROP COLUMN `id_pelapor`,
    DROP COLUMN `jenis_laporan`,
    ADD COLUMN `foto` VARCHAR(191) NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `lokasi` VARCHAR(191) NOT NULL,
    ADD COLUMN `nama_barang` VARCHAR(191) NOT NULL,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `notifikasi` DROP PRIMARY KEY,
    DROP COLUMN `id_from_user`,
    DROP COLUMN `id_klaim`,
    DROP COLUMN `id_laporan`,
    DROP COLUMN `id_notifikasi`,
    DROP COLUMN `id_user`,
    DROP COLUMN `tipe`,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `user_id` INTEGER NOT NULL,
    MODIFY `pesan` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `user` DROP PRIMARY KEY,
    DROP COLUMN `id_user`,
    ADD COLUMN `alamat` VARCHAR(191) NULL,
    ADD COLUMN `id` INTEGER NOT NULL AUTO_INCREMENT,
    ADD COLUMN `nama` VARCHAR(191) NOT NULL,
    ADD COLUMN `no_hp` VARCHAR(191) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- DropTable
DROP TABLE `barang`;

-- DropTable
DROP TABLE `kategori`;

-- DropTable
DROP TABLE `pelapor`;

-- CreateIndex
CREATE UNIQUE INDEX `User_no_hp_key` ON `User`(`no_hp`);

-- AddForeignKey
ALTER TABLE `Laporan` ADD CONSTRAINT `Laporan_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Klaim` ADD CONSTRAINT `Klaim_laporan_id_fkey` FOREIGN KEY (`laporan_id`) REFERENCES `Laporan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Klaim` ADD CONSTRAINT `Klaim_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notifikasi` ADD CONSTRAINT `Notifikasi_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
