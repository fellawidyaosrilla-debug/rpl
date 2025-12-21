const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ===============================
// 1. BUAT LAPORAN (USER)
// ===============================
exports.buatLaporan = async (req, res) => {
  try {
    console.log('DECODED USER:', req.user);
    console.log('BODY:', req.body);
    console.log('FILE:', req.file);

    const {
      nama_barang,
      lokasi_detail,
      jenis_laporan, // <--- KITA AMBIL INI DARI FRONTEND
      kategori,
      tgl_kejadian,
      deskripsi
    } = req.body;

    if (!nama_barang || !lokasi_detail) {
      return res.status(400).json({
        message: 'Nama barang dan lokasi wajib diisi'
      });
    }

    const foto = req.file ? `uploads/${req.file.filename}` : null;

    // Simpan ke Database
    const laporan = await prisma.laporan.create({
      data: {
        nama_barang,
        lokasi: lokasi_detail, 
        foto,
        user_id: req.user.id,
        status: 'MENUNGGU_VERIFIKASI',
        
        // PENTING: Simpan jenis laporan (default KEHILANGAN jika kosong)
        jenis_laporan: jenis_laporan || 'KEHILANGAN' 
      }
    });

    return res.status(201).json({
      message: 'Laporan berhasil dibuat',
      laporan
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: 'Gagal membuat laporan'
    });
  }
};

// ===============================
// 2. GET BERANDA (HANYA DIPUBLIKASIKAN)
// ===============================
exports.getAllLaporan = async (req, res) => {
  try {
    const data = await prisma.laporan.findMany({
      where: { status: 'DIPUBLIKASIKAN' },
      include: { user: true },
      orderBy: { created_at: 'desc' }
    });

    res.json({ status: 'success', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 3. LAPORAN SAYA
// ===============================
exports.getLaporanSaya = async (req, res) => {
  try {
    // Cek apakah user sudah login (req.user ada)
    const data = await prisma.laporan.findMany({
      where: { user_id: req.user.id }, // Sesuaikan field foreign key user
      orderBy: { created_at: 'desc' }
    });

    res.json({ status: 'success', data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 4. DETAIL LAPORAN
// ===============================
exports.getLaporanById = async (req, res) => {
  try {
    // Pastikan field primary key sesuai (id atau id_laporan)
    // Coba gunakan findFirst jika ragu nama kolomnya
    const laporan = await prisma.laporan.findFirst({
      where: { 
        OR: [
            { id: Number(req.params.id) },
            // { id_laporan: Number(req.params.id) } // Uncomment jika pakai id_laporan
        ]
      }, 
      include: {
        user: true
      }
    });

    if (!laporan) {
      return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }

    res.json({ status: 'success', data: laporan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===============================
// 5. VERIFIKASI LAPORAN (ADMIN)
// ===============================
exports.verifikasiLaporan = async (req, res) => {
  try {
    const { id } = req.params; 
    const { status } = req.body; 

    if (!['DIPUBLIKASIKAN', 'DITOLAK'].includes(status)) {
      return res.status(400).json({ message: 'Status tidak valid' });
    }

    const updatedLaporan = await prisma.laporan.update({
      where: { id: Number(id) }, 
      data: { status: status }
    });

    res.json({
      status: 'success',
      message: `Laporan berhasil diubah menjadi ${status}`,
      data: updatedLaporan
    });

  } catch (error) {
    console.error('Error Verifikasi:', error);
    if (error.code === 'P2025') {
       return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    }
    res.status(500).json({ message: 'Gagal memverifikasi laporan' });
  }
};

// ===============================
// 6. DASHBOARD STATS (ADMIN)
// ===============================
exports.getDashboardStats = async (req, res) => {
  try {
    // SEKARANG KITA BISA HITUNG BENERAN KARENA KOLOM 'jenis_laporan' SUDAH ADA
    const [totalUser, barangDitemukan, barangHilang, pending] = await Promise.all([
      prisma.user.count(), 
      
      // Hitung Barang Ditemukan (Yang sudah dipublish)
      prisma.laporan.count({ 
        where: { jenis_laporan: 'DITEMUKAN', status: 'DIPUBLIKASIKAN' } 
      }),
      
      // Hitung Barang Hilang (Yang sudah dipublish)
      prisma.laporan.count({ 
        where: { jenis_laporan: 'KEHILANGAN', status: 'DIPUBLIKASIKAN' } 
      }),
      
      // Hitung yang Pending
      prisma.laporan.count({ 
        where: { status: 'MENUNGGU_VERIFIKASI' } 
      })
    ]);

    res.json({
      status: 'success',
      data: {
        totalUser,
        barangDitemukan,
        barangHilang,
        pending
      }
    });

  } catch (error) {
    console.error('Error Dashboard Stats:', error);
    res.status(500).json({ message: 'Gagal mengambil data dashboard' });
  }
};

// ===============================
// 7. RECENT ACTIVITY (ADMIN)
// ===============================
exports.getRecentActivity = async (req, res) => {
  try {
    const recent = await prisma.laporan.findMany({
      take: 5,
      orderBy: { created_at: 'desc' },
      include: {
        user: { select: { nama: true } }
      }
    });

    res.json({ status: 'success', data: recent });
  } catch (error) {
    console.error('Error Recent Activity:', error);
    res.status(500).json({ message: 'Gagal mengambil aktivitas terbaru' });
  }
};