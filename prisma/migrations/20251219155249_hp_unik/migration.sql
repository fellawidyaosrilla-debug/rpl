/*
  Warnings:

  - A unique constraint covering the columns `[no_hp]` on the table `Pelapor` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Pelapor_no_hp_key` ON `Pelapor`(`no_hp`);
