const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. AJUKAN KLAIM
exports.ajukanKlaim = async (req, res) => {
    try {
        const { id_laporan, deskripsi, kronologi } = req.body;
        const userId = req.user.id; 
        const foto_bukti = req.file ? `uploads/${req.file.filename}` : null;

        // Validasi
        if (!id_laporan) {
            return res.status(400).json({ message: "ID Laporan tidak ditemukan" });
        }

        // Simpan Klaim
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

        // Notifikasi ke Pemilik Barang (User A)
        // Cari laporan berdasarkan ID (Di tabel Laporan kuncinya 'id')
        const laporan = await prisma.laporan.findUnique({
            where: { id: Number(id_laporan) } 
        });

        const pengklaim = await prisma.user.findUnique({
            where: { id: Number(userId) }
        });

        if (laporan) {
            await prisma.notifikasi.create({
                data: {
                    userId: laporan.user_id, // Kirim ke Pemilik Barang
                    judul: 'Klaim Masuk Baru! 📩',
                    pesan: `User ${pengklaim.nama} mengklaim "${laporan.nama_barang}". Cek Kelola Laporan.`,
                    type: 'INFO'
                }
            });
        }

        res.status(201).json({
            status: 'success',
            message: 'Pengajuan klaim berhasil dikirim.',
            data: klaim
        });

    } catch (error) {
        console.error('Error Ajukan Klaim:', error);
        res.status(500).json({ message: 'Terjadi kesalahan server: ' + error.message });
    }
};

// 2. GET KLAIM MASUK (Untuk User A)
exports.getKlaimMasuk = async (req, res) => {
    try {
        const userId = req.user.id; 

        const laporanSaya = await prisma.laporan.findMany({
            where: { user_id: Number(userId) },
            include: {
                klaim: {
                    include: { user: true }, 
                    orderBy: { created_at: 'desc' }
                }
            }
        });

        let daftarKlaim = [];
        laporanSaya.forEach(lap => {
            lap.klaim.forEach(k => {
                daftarKlaim.push({
                    // PERBAIKAN: Gunakan id_klaim sesuai schema
                    id_klaim: k.id_klaim, 
                    barang: lap.nama_barang,
                    foto_barang: lap.foto,
                    pengklaim: k.user.nama,
                    deskripsi_klaim: k.deskripsi_klaim,
                    kronologi: k.kronologi,
                    foto_bukti: k.foto_bukti,
                    status: k.status,
                    tanggal: k.created_at
                });
            });
        });

        res.json({ status: 'success', data: daftarKlaim });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// 3. VERIFIKASI KLAIM (Terima/Tolak)
exports.verifikasiKlaim = async (req, res) => {
    try {
        const { id_klaim, status } = req.body; 
        const userId = req.user.id; 

        // === PERBAIKAN DI SINI (Ganti 'id' jadi 'id_klaim') ===
        const cekKlaim = await prisma.klaim.findFirst({
            where: { 
                id_klaim: Number(id_klaim) // <--- PENTING! Sesuaikan dengan Schema
            },
            include: { 
                laporan: true, 
                user: true 
            } 
        });

        if (!cekKlaim) {
            return res.status(404).json({ message: 'Data klaim tidak ditemukan' });
        }

        if (cekKlaim.laporan.user_id !== userId) {
            return res.status(403).json({ message: 'Anda tidak berhak memverifikasi klaim ini' });
        }

        // Update Status (Ganti 'id' jadi 'id_klaim')
        const updateKlaim = await prisma.klaim.update({
            where: { id_klaim: Number(id_klaim) }, // <--- PENTING!
            data: { status: status }
        });

        // Notifikasi ke Pengklaim
        if (status === 'DISETUJUI') {
            const penemu = await prisma.user.findUnique({ where: { id: userId } });
            
            await prisma.notifikasi.create({
                data: {
                    userId: cekKlaim.user_id,
                    judul: 'Klaim Disetujui! 🎉',
                    pesan: `Selamat! Klaim "${cekKlaim.laporan.nama_barang}" diterima. Hubungi WA: ${penemu.no_hp}`,
                    type: 'KLAIM_DITERIMA'
                }
            });
        }

        res.json({ 
            status: 'success', 
            message: `Klaim berhasil ${status.toLowerCase()}`,
            data: updateKlaim 
        });

    } catch (error) {
        console.error("Error Verifikasi:", error);
        res.status(500).json({ message: 'Gagal memproses verifikasi: ' + error.message });
    }
};