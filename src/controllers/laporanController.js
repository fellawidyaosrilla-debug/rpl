const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. BUAT LAPORAN
exports.buatLaporan = async (req, res) => {
    try {
        console.log("Body:", req.body); // Debug

        const { jenis_laporan, nama_barang, kategori, tgl_kejadian, lokasi, deskripsi } = req.body;
        const userId = req.user.id; 

        // Validasi
        if (!jenis_laporan || !nama_barang || !kategori || !tgl_kejadian || !lokasi) {
            return res.status(400).json({ message: 'Mohon lengkapi data wajib.' });
        }

        // Simpan
        const laporan = await prisma.laporan.create({
            data: {
                user_id: Number(userId),
                jenis_laporan,
                nama_barang,
                kategori,
                tgl_kejadian: new Date(tgl_kejadian), // Pastikan format tanggal
                lokasi,
                deskripsi: deskripsi || '',
                foto: req.file ? `uploads/${req.file.filename}` : null,
                status: 'MENUNGGU_VERIFIKASI'
            }
        });

        res.status(201).json({ status: 'success', data: laporan });
    } catch (error) {
        console.error("Error Create:", error);
        res.status(500).json({ message: error.message });
    }
};

// 2. AMBIL SEMUA (Public - Untuk Beranda)
// Hanya menampilkan yang SUDAH DIPUBLIKASIKAN
exports.getAllLaporan = async (req, res) => {
    try {
        const laporan = await prisma.laporan.findMany({
            where: { status: 'DIPUBLIKASIKAN' },
            orderBy: { created_at: 'desc' },
            include: { user: { select: { nama: true } } }
        });
        res.json({ status: 'success', data: laporan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 3. DETAIL LAPORAN
exports.getDetailLaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const laporan = await prisma.laporan.findUnique({
            where: { id: Number(id) }, 
            include: { user: { select: { nama: true, no_hp: true } } }
        });
        res.json({ status: 'success', data: laporan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 4. LAPORAN SAYA
exports.getLaporanSaya = async (req, res) => {
    try {
        const userId = req.user.id;
        const laporan = await prisma.laporan.findMany({
            where: { user_id: Number(userId) },
            orderBy: { created_at: 'desc' }
        });
        res.json({ status: 'success', data: laporan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 5. VERIFIKASI (Admin)
exports.verifikasiLaporan = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; 
        
        const update = await prisma.laporan.update({
            where: { id: Number(id) }, 
            data: { status: status }
        });
        res.json({ status: 'success', data: update });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 6. DASHBOARD STATS
exports.getDashboardStats = async (req, res) => {
    try {
        const totalUser = await prisma.user.count({ where: { role: 'USER' } });
        const barangDitemukan = await prisma.laporan.count({ where: { jenis_laporan: 'DITEMUKAN' } });
        const barangHilang = await prisma.laporan.count({ where: { jenis_laporan: 'KEHILANGAN' } });
        const pending = await prisma.laporan.count({ where: { status: 'MENUNGGU_VERIFIKASI' } });

        res.json({ status: 'success', data: { totalUser, barangDitemukan, barangHilang, pending } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// 7. RECENT ACTIVITY
exports.getRecentActivity = async (req, res) => {
    try {
        const data = await prisma.laporan.findMany({
            take: 5,
            orderBy: { created_at: 'desc' },
            include: { user: { select: { nama: true } } }
        });
        res.json({ status: 'success', data: data });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// === 8. GET SEMUA LAPORAN (KHUSUS ADMIN) ===
// Ini yang dipakai di halaman status_admin.html
exports.getSemuaLaporan = async (req, res) => {
    try {
        // Ambil SEMUA data tanpa filter status
        const laporan = await prisma.laporan.findMany({
            orderBy: { created_at: 'desc' },
            include: { user: { select: { nama: true } } }
        });
        res.json({ status: 'success', data: laporan });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};