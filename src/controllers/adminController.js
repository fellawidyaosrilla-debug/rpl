const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. Ambil Statistik Dashboard
exports.getDashboardStats = async (req, res) => {
    try {
        const pending = await prisma.laporan.count({ where: { status: 'MENUNGGU_VERIFIKASI' } });
        const totalUser = await prisma.user.count({ where: { role: 'USER' } });
        res.json({ status: 'success', data: { pending, totalUser } });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// 2. Ambil Semua Laporan untuk Tabel Admin
exports.getAllLaporanAdmin = async (req, res) => {
    try {
        const data = await prisma.laporan.findMany({
            include: {
                barang: true, // Mengambil detail nama barang, foto, dll
                pelapor: true  // Mengambil nama orang yang melapor
            },
            orderBy: { created_at: 'desc' }
        });
        res.json({ status: 'success', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. Fungsi Verifikasi Laporan
exports.verifikasiLaporan = async (req, res) => {
    try {
        const { id_laporan } = req.params;
        const { tindakan } = req.body; // 'SETUJU' atau 'TOLAK'

        let statusBaru = tindakan === 'SETUJU' ? 'DIPUBLIKASIKAN' : 'DITOLAK';

        const updated = await prisma.laporan.update({
            where: { id_laporan: parseInt(id_laporan) },
            data: { status: statusBaru }
        });

        res.json({ status: 'success', message: `Laporan ${statusBaru}`, data: updated });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};