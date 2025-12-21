const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.register = async (req, res) => {
  try {
    const { username, nama_lengkap, no_hp, password, alamat } = req.body;

    if (!username || !nama_lengkap || !no_hp || !password) {
      return res.status(400).json({ message: 'Data wajib diisi' });
    }

    const exist = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          { no_hp }
        ]
      }
    });

    if (exist) {
      return res.status(400).json({ message: 'User sudah terdaftar' });
    }

    const hashed = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        username,
        password: hashed,
        nama: nama_lengkap,
        no_hp,
        alamat
      }
    });

    res.status(201).json({ message: 'Registrasi berhasil' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Register gagal' });
  }
};
console.log("PRISMA MODELS:", Object.keys(prisma));

exports.register = async (req, res) => {
    try {
        // === AREA DEBUGGING (CEK TERMINAL VS CODE) ===
        console.log("-----------------------------------------");
        console.log("1. HEADERS:", req.headers['content-type']); // Harusnya: application/json
        console.log("2. BODY RAW:", req.body);                 // Harusnya: { nama: '...', no_hp: '...', password: '...' }
        console.log("-----------------------------------------");

        // Ambil data
        const { nama, no_hp, password } = req.body;

        // Validasi
        if (!nama || !no_hp || !password) {
            console.log("GAGAL: Salah satu data kosong/undefined");
            return res.status(400).json({ 
                message: 'Data wajib diisi',
                received: req.body // Kirim balik apa yang diterima biar kelihatan di Network Tab
            });
        }

        // Cek User Ganda
        const existingUser = await prisma.user.findUnique({ where: { no_hp: no_hp } });
        if (existingUser) {
            return res.status(400).json({ message: 'Nomor HP sudah terdaftar' });
        }

        // Hash & Simpan
        const hashedPassword = await bcrypt.hash(password, 10);
        // Simpan User
        const user = await prisma.user.create({
            data: {
                nama,
                no_hp,
                username: no_hp, // <--- TAMBAHKAN INI (Pakai no_hp sebagai username)
                password: hashedPassword,
                role: 'USER'
            }
        });
        res.status(201).json({ message: 'Registrasi berhasil', data: user });

    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};

exports.login = async (req, res) => {
  try {
    const { no_hp, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { no_hp }
    });

    if (!user) {
      return res.status(404).json({ message: 'User tidak ditemukan' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Password salah' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'temu_cepat_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login berhasil',
      token,
      user: {
        nama: user.nama,
        role: user.role
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Login gagal' });
  }
};
