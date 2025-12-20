const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// === 1. AJUKAN KLAIM BARU ===
exports.ajukanKlaim = async (req, res) => {
  try {
    // Data dari Frontend (Body)
    const { id_laporan, bukti_kepemilikan, tgl_hilang } = req.body;
    
    // Data dari Token (Middleware)
    const id_user_pelapor = req.user && req.user.id ? req.user.id : null; // User yang sedang login

    // Debug logging to help trace issues causing 500
    console.log('AJUKAN KLAIM request:', { id_user_pelapor, id_laporan, hasFile: !!req.file });

    if (!id_user_pelapor) return res.status(401).json({ message: 'Token tidak valid atau user tidak terautentikasi.' });

    if (!id_laporan || !bukti_kepemilikan) {
      return res.status(400).json({ message: 'Field id_laporan dan bukti_kepemilikan wajib diisi.' });
    }

    // A. Cek dulu: Laporannya ada & statusnya OK?
    const laporan = await prisma.laporan.findUnique({
      where: { id_laporan: parseInt(id_laporan) }
    });

    if (!laporan) {
      console.warn('AJUKAN KLAIM: laporan tidak ditemukan', { id_laporan });
      return res.status(404).json({ message: 'Barang tidak ditemukan' });
    }

    if (laporan.status !== 'DIPUBLIKASIKAN') {
      console.warn('AJUKAN KLAIM: status laporan tidak memungkinkan klaim', { id_laporan, status: laporan.status });
      return res.status(400).json({ message: 'Barang ini tidak bisa diklaim (sedang diproses/selesai)' });
    }

    // B. Cek: Apakah user ini SUDAH pernah klaim barang ini?
    const cekKlaim = await prisma.klaim.findFirst({
      where: {
        id_laporan: parseInt(id_laporan),
        pemilik_klaim: { id_user: id_user_pelapor }
      }
    });

    if (cekKlaim) {
      return res.status(400).json({ message: 'Anda sudah mengajukan klaim untuk barang ini. Tunggu verifikasi.' });
    }

    // C. Cari ID Pelapor milik user ini (karena tabel Klaim butuh id_pelapor, bukan id_user)
    const pelaporSaya = await prisma.pelapor.findUnique({
      where: { id_user: id_user_pelapor }
    });

    if (!pelaporSaya) {
      console.warn('AJUKAN KLAIM: pelapor tidak ditemukan untuk user', { id_user_pelapor });
      return res.status(400).json({ message: 'Profil pelapor Anda belum lengkap.' });
    }

    // D. Simpan Klaim (mendukung upload foto bukti)
    const fotoPath = req.file ? `uploads/${req.file.filename}` : null;
    const kronologi = req.body.kronologi || '';

    const finalBukti = kronologi ? `${bukti_kepemilikan}\n\nKronologi: ${kronologi}` : bukti_kepemilikan;

    // Validate date format loosely
    let tglHilangDate = null;
    if (tgl_hilang) {
      const d = new Date(tgl_hilang);
      if (isNaN(d.getTime())) {
        return res.status(400).json({ message: 'Format tanggal tgl_hilang tidak valid. Gunakan YYYY-MM-DD.' });
      }
      tglHilangDate = d;
    }

    console.log('AJUKAN KLAIM: creating claim, data:', { id_laporan, pelaporId: pelaporSaya.id_pelapor, fotoPath, tglHilangDate });

    const klaimBaru = await prisma.klaim.create({
      data: {
        id_laporan: parseInt(id_laporan),
        id_pemilik_klaim: pelaporSaya.id_pelapor,
        bukti_kepemilikan: finalBukti,
        foto_bukti: fotoPath,
        tgl_hilang: tglHilangDate,
        status: 'PENDING'
      }
    });

    // E. (Opsional) Kirim Notifikasi ke Penemu Barang bahwa ada yang mengklaim
    try {
      // Cari data penemu (Pelapor) terlebih dahulu supaya kita mendapatkan id_user penemu
      const pelaporPenemu = await prisma.pelapor.findUnique({ where: { id_pelapor: laporan.id_pelapor } });
      if (!pelaporPenemu || !pelaporPenemu.id_user) {
        console.warn('AJUKAN KLAIM: penemu tidak ditemukan atau belum punya user id', { id_pelapor: laporan.id_pelapor });
      } else {
        const notif = await prisma.notifikasi.create({
          data: {
            judul: "Ada Klaim Masuk! 🔔",
            pesan: `Seseorang baru saja mengklaim barang "${laporan.nama_barang}". Review klaim di Notifikasi. KlaimId: ${klaimBaru.id_klaim}`,
            id_user: pelaporPenemu.id_user, // Kirim ke penemu (User.id)
            id_laporan: laporan.id_laporan,
            id_klaim: klaimBaru.id_klaim,
            tipe: 'CLAIM'
          }
        });
        console.log('AJUKAN KLAIM: notifikasi dibuat', { id_notifikasi: notif.id_notifikasi, to_user: pelaporPenemu.id_user });
      }
    } catch (notifError) {
      // Don't fail the claim creation if notification cannot be created (e.g., migration not applied yet)
      console.warn('AJUKAN KLAIM: gagal membuat notifikasi', { message: notifError.message });
    }

    console.log('AJUKAN KLAIM: success', { id_klaim: klaimBaru.id_klaim });

    res.status(201).json({
      message: 'Klaim berhasil diajukan! Tunggu respon dari penemu.',
      data: klaimBaru
    });

  } catch (error) {
    console.error('AJUKAN KLAIM: ERROR', error);
    res.status(500).json({ message: 'Gagal mengajukan klaim', error: error.message });
  }
};

// === 2. LIHAT RIWAYAT KLAIM SAYA (Untuk Profil User) ===
exports.getKlaimSaya = async (req, res) => {
  try {
    const id_user = req.user.id;

    const myClaims = await prisma.klaim.findMany({
      where: {
        pemilik_klaim: { id_user: id_user }
      },
      include: {
        laporan: { include: { barang: true } }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ status: 'success', data: myClaims });

  } catch (error) {
    res.status(500).json({ message: 'Gagal ambil data', error: error.message });
  }
};

// === 3. LIHAT KLAIM MASUK UNTUK PENEMU ===
exports.getClaimsForOwner = async (req, res) => {
  try {
    // Cari pelapor yang merepresentasikan penemu (yang sedang login)
    const id_user = req.user.id;
    const pelapor = await prisma.pelapor.findUnique({ where: { id_user } });
    if (!pelapor) return res.status(400).json({ message: 'Data penemu tidak ditemukan' });

    // Ambil klaim untuk laporan milik penemu
    const incoming = await prisma.klaim.findMany({
      where: {
        laporan: { id_pelapor: pelapor.id_pelapor }
      },
      include: {
        laporan: { include: { barang: true } },
        pemilik_klaim: true
      },
      orderBy: { created_at: 'desc' }
    });

    // Map untuk menyembunyikan data pribadi pemilik klaim
    const mapped = incoming.map(k => ({
      id_klaim: k.id_klaim,
      id_laporan: k.id_laporan,
      bukti_kepemilikan: k.bukti_kepemilikan,
      foto_bukti: k.foto_bukti,
      tgl_hilang: k.tgl_hilang,
      status: k.status,
      created_at: k.created_at,
      // Tidak menyertakan nama/no_hp pemilik klaim untuk privasi
      // Jika diperlukan, kita bisa tambahkan flag apakah pemilik klaim sudah diverifikasi
    }));

    res.json({ status: 'success', data: mapped });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal ambil klaim masuk', error: error.message });
  }
};