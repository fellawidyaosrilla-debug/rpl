const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Secret Key untuk Token (Bisa diganti nanti)
const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_temucepat';

// === REGISTER (DAFTAR) ===
exports.register = async (req, res) => {
  try {
    // 1. Terima data dari Frontend
    const { username, password, nama_lengkap, no_hp, alamat } = req.body;

    // 2. Cek apakah Username sudah ada?
    const cekUser = await prisma.user.findUnique({
      where: { username: username }
    });

    if (cekUser) {
      return res.status(400).json({ message: 'Username sudah dipakai!' });
    }

    // 3. Acak Password (Hashing)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Simpan ke Database (User & Pelapor sekaligus)
    const result = await prisma.$transaction(async (prisma) => {
      // a. Buat Akun User
      const newUser = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          role: 'USER'
        }
      });

      // b. Buat Data Pelapor (Profile)
      await prisma.pelapor.create({
        data: {
          nama_lengkap,
          no_hp,
          alamat,
          id_user: newUser.id_user // Sambung ke User di atas
        }
      });

      return newUser;
    });

    res.status(201).json({
      message: 'Registrasi Berhasil! Silakan Login.',
      username: result.username
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal Register', error: error.message });
  }
};

// === LOGIN (MASUK) ===
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Cari User berdasarkan Username
    const user = await prisma.user.findUnique({
      where: { username },
      include: { pelapor: true } // Ambil sekalian data profilnya
    });

    if (!user) {
      return res.status(401).json({ message: 'Username atau Password Salah!' });
    }

    // 2. Cek Password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: 'Username atau Password Salah!' });
    }

    // 3. Buat Token (Karcis Masuk)
    const token = jwt.sign(
      { id: user.id_user, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.status(200).json({
      message: 'Login Berhasil!',
      token,
      data: {
        id: user.id_user,
        nama: user.pelapor?.nama_lengkap,
        role: user.role
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error Server' });
  }
};