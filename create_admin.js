const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('admin123', 10);

  await prisma.user.upsert({
    where: { username: 'super_admin' },
    update: {},
    create: {
      username: 'super_admin',
      password: passwordHash,
      nama: 'Administrator',
      no_hp: '0000000000', // ✅ WAJIB karena login pakai no_hp
      role: 'ADMIN'
    }
  });

  console.log('✅ Akun ADMIN berhasil dibuat');
  console.log('Login via no_hp: 0000000000');
  console.log('Password: admin123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
