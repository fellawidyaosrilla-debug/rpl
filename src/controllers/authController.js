const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.login = async (req, res) => {
    try {
        const { no_hp, password } = req.body; 

        // Cari record Pelapor berdasarkan nomor HP, sekaligus ambil relasi user
        const pelapor = await prisma.pelapor.findUnique({
            where: { no_hp: String(no_hp) },
            include: { user: true }
        });

        // Jika ada pelapor, ambil user dari relasi; kalau tidak ada, coba fallback cari user.username == no_hp
        let user = pelapor && pelapor.user ? pelapor.user : null;
        if (!user) {
            user = await prisma.user.findUnique({ where: { username: String(no_hp) } });
        }

        if (!user) {
            return res.status(404).json({ message: "Nomor HP tidak terdaftar!" });
        }

        // Verifikasi Password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Nomor HP atau Password salah." });
        }

        // Generate Token
        const secret = process.env.JWT_SECRET || 'temu_cepat_secret_key_2025';
        const token = jwt.sign(
            { id: user.id_user, role: user.role }, 
            secret, 
            { expiresIn: '24h' }
        );

        // Tentukan nama yang akan ditampilkan di frontend:
        // - Jika ada nama_lengkap di tabel Pelapor, pakai itu (lebih 'manusiawi')
        // - Kalau tidak ada, pakai user.username
        let displayName = user.username;
        if (pelapor && pelapor.nama_lengkap && pelapor.nama_lengkap.trim() !== '') {
            displayName = pelapor.nama_lengkap;
        }

        // Response untuk frontend
        return res.status(200).json({
            message: "Login Berhasil",
            token: token,
            user: { 
                nama: displayName,
                role: user.role 
            }
        });

    } catch (error) {
        console.error("ERROR:", error);
        return res.status(500).json({ message: "Terjadi kesalahan server." });
    }
};

exports.register = async (req, res) => {
    try {
        const { username, nama_lengkap, no_hp, password, alamat } = req.body;
        if (!username || !nama_lengkap || !no_hp || !password) {
            return res.status(400).json({ message: 'Field username, nama_lengkap, no_hp, dan password wajib diisi.' });
        }

        // Cek apakah username atau nomor hp sudah terdaftar
        const existingUser = await prisma.user.findUnique({ where: { username: String(username) } });
        const existingPelapor = await prisma.pelapor.findUnique({ where: { no_hp: String(no_hp) } });

        if (existingUser || existingPelapor) {
            return res.status(400).json({ message: 'Nomor HP atau username sudah terdaftar.' });
        }

        // Hash password
        const saltRounds = 10;
        const hashed = await bcrypt.hash(password, saltRounds);

        // Buat user dan profil pelapor dalam satu transaksi logis
        const newUser = await prisma.user.create({
            data: {
                username: String(username),
                password: hashed
            }
        });

        await prisma.pelapor.create({
            data: {
                nama_lengkap: String(nama_lengkap),
                no_hp: String(no_hp),
                alamat: String(alamat || '-'),
                id_user: newUser.id_user
            }
        });

        return res.status(201).json({ message: 'Registrasi berhasil. Silakan login.' });

    } catch (error) {
        console.error('REGISTER ERROR:', error);
        return res.status(500).json({ message: 'Gagal registrasi', error: error.message });
    }
};