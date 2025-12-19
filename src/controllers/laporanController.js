const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// === MEMBUAT LAPORAN BARU ===
exports.createLaporan = async (req, res) => {
  try {
    // 1. Tangkap data text dari Body
    const { 
      nama_barang, 
      deskripsi, 
      tgl_ditemukan, 
      lokasi_detail, 
      id_kategori, 
      jenis_laporan // Harus 'KEHILANGAN' atau 'PENEMUAN'
    } = req.body;

    // 2. Tangkap File Foto (dari Middleware Multer)
    // Kalau user tidak upload foto, isinya null
    const foto_barang = req.file ? req.file.path : null;

    // 3. Cari ID Pelapor berdasarkan User yang sedang Login
    // (req.user.id didapat dari Token JWT)
    const user = await prisma.user.findUnique({
      where: { id_user: req.user.id },
      include: { pelapor: true }
    });

    if (!user || !user.pelapor) {
      return res.status(404).json({ message: 'Data pelapor tidak ditemukan. Pastikan sudah login dengan benar.' });
    }

    // 4. TRANSAKSI DATABASE (Simpan Barang + Laporan)
    const result = await prisma.$transaction(async (prisma) => {
      
      // A. Simpan data BARANG dulu
      const barangBaru = await prisma.barang.create({
        data: {
          nama_barang,
          deskripsi,
          tgl_ditemukan: new Date(tgl_ditemukan), // Convert text jadi Tanggal
          lokasi_detail,
          foto_barang, // Path foto disimpan di sini
          id_kategori: parseInt(id_kategori) // Pastikan jadi angka
        }
      });

      // B. Buat LAPORAN yang menyambungkan Barang + Pelapor
      const laporanBaru = await prisma.laporan.create({
        data: {
          jenis_laporan, // 'KEHILANGAN' atau 'PENEMUAN'
          status: 'MENUNGGU_VERIFIKASI',
          id_pelapor: user.pelapor.id_pelapor,
          id_barang: barangBaru.id_barang
        }
      });

      return { barang: barangBaru, laporan: laporanBaru };
    });

    res.status(201).json({
      message: 'Laporan berhasil dibuat!',
      data: result
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal membuat laporan', error: error.message });
  }
};

// === MELIHAT SEMUA LAPORAN (Untuk Feed Beranda) ===
exports.getAllLaporan = async (req, res) => {
  try {
    const data = await prisma.laporan.findMany({
      include: {
        barang: {
          include: { kategori: true }
        },
        pelapor: {
          select: { nama_lengkap: true, foto_profil: true } // Jangan tampilkan No HP (Privasi)
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ status: 'success', data });
  } catch (error) {
    res.status(500).json({ message: 'Error Server', error: error.message });
  }
};