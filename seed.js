const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Sedang mengisi data kategori...');

  const kategori = [
    'Elektronik', 
    'Dompet/Tas', 
    'Dokumen', 
    'Kunci', 
    'Kendaraan',
    'Lainnya'
  ];

  for (const k of kategori) {
    // Cek dulu biar gak dobel
    const ada = await prisma.kategori.findFirst({
      where: { nama_kategori: k }
    });

    if (!ada) {
      await prisma.kategori.create({
        data: { nama_kategori: k }
      });
    }
  }
  console.log('✅ BERHASIL! Tabel Kategori sudah terisi.');
}

main()
  .catch(e => {
    console.error('Gagal seeding:', e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());