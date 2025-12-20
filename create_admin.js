const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Pastikan install bcryptjs
const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10); // Password admin

  // Buat atau perbarui User Admin (upsert)
  let admin = await prisma.user.findUnique({ where: { username: 'super_admin' }, include: { pelapor: true } });

  if (admin) {
    // Update password/role jika sudah ada, lalu upsert data Pelapor (no_hp akan diset)
    admin = await prisma.user.update({
      where: { username: 'super_admin' },
      data: {
        password: passwordHash,
        role: 'ADMIN'
      }
    });

    await prisma.pelapor.upsert({
      where: { id_user: admin.id_user },
      update: {
        nama_lengkap: 'Administrator Sistem',
        no_hp: '08123456789',
        alamat: 'Kantor Pusat'
      },
      create: {
        nama_lengkap: 'Administrator Sistem',
        no_hp: '08123456789',
        alamat: 'Kantor Pusat',
        id_user: admin.id_user
      }
    });

    console.log('✅ Akun ADMIN diperbarui (upsert)');
  } else {
    // Jika belum ada, buat baru beserta Pelapor
    admin = await prisma.user.create({
      data: {
        username: 'super_admin',
        password: passwordHash,
        role: 'ADMIN',
        pelapor: {
          create: {
            nama_lengkap: 'Administrator Sistem',
            no_hp: '08123456789',
            alamat: 'Kantor Pusat'
          }
        }
      }
    });

    console.log('✅ Akun ADMIN berhasil dibuat!');
  }

  console.log('Username: super_admin');
  console.log('Phone: 08123456789');
  console.log('Password: admin123');
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());