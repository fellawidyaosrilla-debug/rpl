const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.ajukanKlaim = async (req, res) => {
    try {
        const { id_laporan, deskripsi, kronologi } = req.body;
        const userId = req.user.id; // Dari token

        // Validasi input
        if (!deskripsi || !kronologi) {
            return res.status(400).json({ message: 'Deskripsi dan Kronologi wajib diisi' });
        }

        const foto_bukti = req.file ? `uploads/${req.file.filename}` : null;

        // Simpan ke database
        const klaim = await prisma.klaim.create({
            data: {
                user_id: Number(userId),
                laporan_id: Number(id_laporan),
                deskripsi_klaim: deskripsi,
                kronologi: kronologi,
                foto_bukti: foto_bukti,
                status: 'PENDING'
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'Pengajuan klaim berhasil dikirim. Tunggu verifikasi admin/penemu.',
            data: klaim
        });

    } catch (error) {
        console.error('Error Ajukan Klaim:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server' });
    }
};