const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// === USER MENGAJUKAN KLAIM ===
exports.ajukanKlaim = async (req, res) => {
  try {
    // 1. Tangkap Data (Termasuk Tanggal)
    const { id_laporan, bukti_kepemilikan, tgl_hilang } = req.body;
    const id_user_pengklaim = req.user.id;

    // 2. Tangkap Foto (Kalau ada)
    // Kalau user upload foto, ambil path-nya. Kalau tidak, isi null.
    const foto_bukti = req.file ? req.file.path : null;

    // ... (Validasi user & laporan sama seperti sebelumnya) ...
    const userPengklaim = await prisma.user.findUnique({
      where: { id_user: id_user_pengklaim },
      include: { pelapor: true }
    });
    
    const laporan = await prisma.laporan.findUnique({
      where: { id_laporan: parseInt(id_laporan) },
      include: { pelapor: { include: { user: true } }, barang: true }
    });

    if (!laporan) return res.status(404).json({ message: 'Laporan tidak ditemukan' });
    if (laporan.pelapor.user.id_user === id_user_pengklaim) {
      return res.status(400).json({ message: 'Gabisa klaim barang sendiri woi!' });
    }
    // ... (Akhir Validasi) ...


    // 3. TRANSACTION: Simpan Data Lengkap
    await prisma.$transaction(async (prisma) => {
      
      // A. Simpan Klaim (Update kolom-kolom baru)
      const klaimBaru = await prisma.klaim.create({
        data: {
          id_laporan: parseInt(id_laporan),
          id_pemilik_klaim: userPengklaim.pelapor.id_pelapor,
          
          // Data detail:
          bukti_kepemilikan: bukti_kepemilikan,
          foto_bukti: foto_bukti,
          // Ubah string tanggal jadi format Date komputer
          tgl_hilang: tgl_hilang ? new Date(tgl_hilang) : null 
        }
      });

      // B. Kirim Notif (Pesan lebih meyakinkan)
      const pesanNotif = `Klaim Baru! 📸 Ada foto bukti & deskripsi untuk "${laporan.barang.nama_barang}". Cek sekarang.`;

      await prisma.notifikasi.create({
        data: {
          id_user: laporan.pelapor.user.id_user,
          judul: 'Bukti Klaim Masuk! 📂', // Judul baru
          pesan: pesanNotif,
          id_klaim: klaimBaru.id_klaim
        }
      });
    });

    res.status(201).json({ message: 'Klaim lengkap berhasil dikirim!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal mengajukan klaim', error: error.message });
  }
};

// === AMBIL DAFTAR NOTIFIKASI SAYA ===
exports.getNotifikasiSaya = async (req, res) => {
  try {
    const notifikasi = await prisma.notifikasi.findMany({
      where: { id_user: req.user.id },
      orderBy: { created_at: 'desc' }
    });

    res.status(200).json({ status: 'success', data: notifikasi });
  } catch (error) {
    res.status(500).json({ message: 'Error server', error: error.message });
  }
};

// === PENEMU MEMUTUSKAN KLAIM (TERIMA / TOLAK) ===
exports.verifikasiKlaim = async (req, res) => {
  try {
    const { id_klaim, status_keputusan } = req.body; 
    const id_user_penemu = req.user.id;

    const klaim = await prisma.klaim.findUnique({
      where: { id_klaim: parseInt(id_klaim) },
      include: {
        laporan: {
          include: { 
            pelapor: { include: { user: true } },
            barang: true
          }
        },
        pemilik_klaim: { // Sesuai schema baru
          include: { user: true } 
        }
      }
    });

    if (!klaim) return res.status(404).json({ message: 'Data klaim tidak ditemukan' });

    if (klaim.laporan.pelapor.user.id_user !== id_user_penemu) {
      return res.status(403).json({ message: 'Anda tidak berhak memverifikasi klaim ini.' });
    }

    await prisma.$transaction(async (prisma) => {
      
      await prisma.klaim.update({
        where: { id_klaim: parseInt(id_klaim) },
        data: { status: status_keputusan }
      });

      if (status_keputusan === 'DITERIMA') {
        const noHpPenemu = klaim.laporan.pelapor.no_hp; 
        const pesanNotif = `Selamat! Klaim barang "${klaim.laporan.barang.nama_barang}" disetujui. Hubungi Penemu via WA: ${noHpPenemu}. Silakan selesaikan di luar aplikasi.`;

        await prisma.notifikasi.create({
          data: {
            id_user: klaim.pemilik_klaim.user.id_user, 
            judul: 'Klaim Diterima! 🎉',
            pesan: pesanNotif,
            id_klaim: klaim.id_klaim
          }
        });
        
        await prisma.laporan.update({
          where: { id_laporan: klaim.laporan.id_laporan },
          data: { status: 'SELESAI' }
        });

      } else {
        await prisma.notifikasi.create({
          data: {
            id_user: klaim.pemilik_klaim.user.id_user,
            judul: 'Klaim Ditolak ❌',
            pesan: `Maaf, klaim anda untuk barang "${klaim.laporan.barang.nama_barang}" ditolak oleh penemu.`,
            id_klaim: klaim.id_klaim
          }
        });
      }
    });

    res.status(200).json({ message: `Klaim berhasil ${status_keputusan}` });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal memverifikasi klaim', error: error.message });
  }
};