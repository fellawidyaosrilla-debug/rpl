const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Ambil notifikasi milik user yang sedang login
exports.getMyNotifikasi = async (req, res) => {
  try {
    const id_user = req.user.id;
    const notifs = await prisma.notifikasi.findMany({
      where: { id_user },
      include: { laporan: true, klaim: true },
      orderBy: { created_at: 'desc' }
    });

    res.json({ status: 'success', data: notifs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal ambil notifikasi', error: error.message });
  }
};

// Penemu mengkonfirmasi klaim -> kirim nomor ke pemilik klaim
exports.confirmClaim = async (req, res) => {
  try {
    const { id_klaim } = req.body;
    if (!id_klaim) return res.status(400).json({ message: 'id_klaim diperlukan' });

    const klaim = await prisma.klaim.findUnique({ where: { id_klaim: parseInt(id_klaim) }, include: { laporan: true } });
    if (!klaim) return res.status(404).json({ message: 'Klaim tidak ditemukan' });

    // Pastikan yang mengkonfirmasi adalah penemu (pemilik laporan)
    const laporan = klaim.laporan;
    const pelaporPenemu = await prisma.pelapor.findUnique({ where: { id_pelapor: laporan.id_pelapor } });
    if (!pelaporPenemu) return res.status(400).json({ message: 'Data penemu tidak ditemukan' });

    if (pelaporPenemu.id_user !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak: Hanya penemu yang dapat konfirmasi klaim ini' });
    }

    // Ambil informasi pemilik klaim (pelapor yang mengklaim)
    const pelaporPemilik = await prisma.pelapor.findUnique({ where: { id_pelapor: klaim.id_pemilik_klaim } });
    if (!pelaporPemilik) return res.status(400).json({ message: 'Data pemilik klaim tidak ditemukan' });

    // Update klaim status ke DITERIMA
    await prisma.klaim.update({ where: { id_klaim: klaim.id_klaim }, data: { status: 'DITERIMA' } });

    // Buat notifikasi ke pemilik klaim: kirim nomor penemu bagi yang mengklaim
    const msg = `Penemu telah mengonfirmasi klaim Anda untuk laporan #${laporan.id_laporan}. Nomor penemu: ${pelaporPenemu.no_hp}. Silakan hubungi untuk verifikasi.`;

    const notif = await prisma.notifikasi.create({
      data: {
        judul: 'Klaim Disetujui',
        pesan: msg,
        tipe: 'CLAIM',
        id_user: pelaporPemilik.id_user,
        id_laporan: laporan.id_laporan,
        id_klaim: klaim.id_klaim
      }
    });

    console.log('CONFIRM CLAIM: notification sent', { id_notifikasi: notif.id_notifikasi, to_user: pelaporPemilik.id_user });

    res.json({ status: 'success', message: 'Klaim dikonfirmasi dan nomor penemu dikirim ke pemilik klaim' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal konfirmasi klaim', error: error.message });
  }
};

exports.rejectClaim = async (req, res) => {
  try {
    const { id_klaim } = req.body;
    if (!id_klaim) return res.status(400).json({ message: 'id_klaim diperlukan' });

    const klaim = await prisma.klaim.findUnique({ where: { id_klaim: parseInt(id_klaim) }, include: { laporan: true } });
    if (!klaim) return res.status(404).json({ message: 'Klaim tidak ditemukan' });

    const laporan = klaim.laporan;
    const pelaporPenemu = await prisma.pelapor.findUnique({ where: { id_pelapor: laporan.id_pelapor } });
    if (!pelaporPenemu) return res.status(400).json({ message: 'Data penemu tidak ditemukan' });

    if (pelaporPenemu.id_user !== req.user.id) {
      return res.status(403).json({ message: 'Akses ditolak: Hanya penemu yang dapat menolak klaim ini' });
    }

    await prisma.klaim.update({ where: { id_klaim: klaim.id_klaim }, data: { status: 'DITOLAK' } });

    // Notifikasi ke pemilik klaim
    const ownerPelapor = await prisma.pelapor.findUnique({ where: { id_pelapor: klaim.id_pemilik_klaim } });
    if (ownerPelapor && ownerPelapor.id_user) {
      const notif = await prisma.notifikasi.create({
        data: {
          judul: 'Klaim Ditolak',
          pesan: `Klaim Anda untuk laporan #${laporan.id_laporan} ditolak oleh penemu.`,
          tipe: 'CLAIM',
          id_user: ownerPelapor.id_user,
          id_laporan: laporan.id_laporan,
          id_klaim: klaim.id_klaim
        }
      });
      console.log('REJECT CLAIM: notification sent', { id_notifikasi: notif.id_notifikasi, to_user: ownerPelapor.id_user });
    }

    res.json({ status: 'success', message: 'Klaim ditolak dan pemilik klaim diberi tahu' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menolak klaim', error: error.message });
  }
};

// Tandai notifikasi sebagai dibaca
exports.markRead = async (req, res) => {
  try {
    const { id_notifikasi } = req.body;
    if (!id_notifikasi) return res.status(400).json({ message: 'id_notifikasi diperlukan' });

    const notif = await prisma.notifikasi.findUnique({ where: { id_notifikasi: parseInt(id_notifikasi) } });
    if (!notif) return res.status(404).json({ message: 'Notifikasi tidak ditemukan' });
    if (notif.id_user !== req.user.id) return res.status(403).json({ message: 'Tidak berhak mengubah notifikasi ini' });

    await prisma.notifikasi.update({ where: { id_notifikasi: notif.id_notifikasi }, data: { is_read: true } });
    res.json({ status: 'success', message: 'Notifikasi ditandai sebagai dibaca' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menandai notifikasi', error: error.message });
  }
};

// Tandai semua notifikasi milik user sebagai dibaca
exports.markAllRead = async (req, res) => {
  try {
    const id_user = req.user.id;
    await prisma.notifikasi.updateMany({ where: { id_user }, data: { is_read: true } });
    res.json({ status: 'success', message: 'Semua notifikasi ditandai sebagai dibaca' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Gagal menandai semua notifikasi', error: error.message });
  }
};