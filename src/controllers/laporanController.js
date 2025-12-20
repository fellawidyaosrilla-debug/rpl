const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. BUAT LAPORAN

exports.buatLaporan = async (req, res) => {
  try {
    const { nama_barang, kategori, lokasi_detail, deskripsi, jenis_laporan, tgl_kejadian } = req.body;
    
    if (!req.user) return res.status(401).json({ message: "Token tidak valid" });
    const id_user = req.user.id; 

    // 1. Cari data pelapor
    const pelaporData = await prisma.pelapor.findUnique({ where: { id_user } });
    if (!pelaporData) return res.status(400).json({ message: "Data pelapor tidak ditemukan." });

    // 2. Cari ID Kategori berdasarkan nama kategori yang dikirim frontend
    // Karena di tabel Barang, id_kategori wajib berupa Int
    let kategoriData = await prisma.kategori.findFirst({
        where: { nama_kategori: kategori }
    });

    // Jika kategori belum ada di database, buat otomatis (opsional) atau gunakan kategori default
    if (!kategoriData) {
        kategoriData = await prisma.kategori.create({
            data: { nama_kategori: kategori }
        });
    }

    const foto_path = req.file ? `uploads/${req.file.filename}` : null;

    // 3. Simpan Laporan SEKALIGUS membuat data Barang (Nested Create)
    // Sesuai schema: Laporan butuh Barang, Barang butuh Kategori
    const laporan = await prisma.laporan.create({
      data: {
        jenis_laporan: jenis_laporan, // Menggunakan Enum JenisLaporan
        status: 'MENUNGGU_VERIFIKASI', // Menggunakan Enum StatusLaporan
        pelapor: {
          connect: { id_pelapor: pelaporData.id_pelapor }
        },
        barang: {
          create: {
            nama_barang: nama_barang,
            deskripsi: deskripsi,
            tgl_ditemukan: new Date(tgl_kejadian),
            lokasi_detail: lokasi_detail,
            foto_barang: foto_path,
            kategori: {
              connect: { id_kategori: kategoriData.id_kategori }
            }
          }
        }
      },
      include: {
        barang: {
            include: { kategori: true }
        },
        pelapor: true
      }
    });

    res.status(201).json({ 
        message: "Laporan berhasil dibuat!", 
        data: laporan 
    });

  } catch (error) {
    console.error("DETEKSI ERROR PRISMA:", error);
    res.status(500).json({ 
        message: "Gagal buat laporan", 
        error: error.message 
    });
  }
};

// ... fungsi lainnya (getAllLaporan, dll) tetap sama
// 2. GET ALL LAPORAN (HANYA YANG DIPUBLIKASIKAN, FORMAT UNTUK BERANDA)
exports.getAllLaporan = async (req, res) => {
  try {
    // Hanya ambil laporan yang sudah dipublikasikan
    const laporans = await prisma.laporan.findMany({
      where: { status: 'DIPUBLIKASIKAN' },
      include: {
        barang: { include: { kategori: true } },
        pelapor: true
      },
      orderBy: { created_at: 'desc' }
    });

    // Flat-mapping agar frontend (beranda.js) mendapatkan field yang diharapkan
    const mapped = laporans.map(l => ({
      id_laporan: l.id_laporan,
      nama_barang: l.barang.nama_barang,
      deskripsi: l.barang.deskripsi,
      lokasi_detail: l.barang.lokasi_detail,
      foto_barang: l.barang.foto_barang,
      tgl_kejadian: l.barang.tgl_ditemukan,
      jenis_laporan: l.jenis_laporan,
      kategori: l.barang.kategori ? l.barang.kategori.nama_kategori : null,
      pelapor: {
        nama_lengkap: l.pelapor.nama_lengkap,
        no_hp: l.pelapor.no_hp
      }
    }));

    res.json({ status: 'success', data: mapped });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. GET LAPORAN SAYA
exports.getLaporanSaya = async (req, res) => {
  try {
    const id_user = req.user.id;
    const pelapor = await prisma.pelapor.findUnique({ where: { id_user } });
    const myLaporans = await prisma.laporan.findMany({
      where: { id_pelapor: pelapor.id_pelapor },
      orderBy: { created_at: 'desc' }
    });
    res.json({ status: 'success', data: myLaporans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 4. GET BY ID
exports.getLaporanById = async (req, res) => {
  try {
    const { id } = req.params;
    const laporan = await prisma.laporan.findUnique({
      where: { id_laporan: parseInt(id) },
      include: { pelapor: true, barang: { include: { kategori: true } } }
    });
    if(!laporan) return res.status(404).json({message: "Tidak ditemukan"});

    // Map to a friendly structure similar to /api/laporan list
    const mapped = {
      id_laporan: laporan.id_laporan,
      nama_barang: laporan.barang ? laporan.barang.nama_barang : null,
      deskripsi: laporan.barang ? laporan.barang.deskripsi : null,
      lokasi_detail: laporan.barang ? laporan.barang.lokasi_detail : null,
      foto_barang: laporan.barang ? laporan.barang.foto_barang : null,
      tgl_kejadian: laporan.barang ? laporan.barang.tgl_ditemukan : null,
      jenis_laporan: laporan.jenis_laporan,
      status: laporan.status,
      pelapor: laporan.pelapor ? { nama_lengkap: laporan.pelapor.nama_lengkap, no_hp: laporan.pelapor.no_hp } : null
    };

    res.json({ status: 'success', data: mapped });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};