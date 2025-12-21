const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * DASHBOARD STATS
 */
exports.getDashboardStats = async (req, res) => {
  try {
    const pending = await prisma.laporan.count({
      where: { status: 'MENUNGGU_VERIFIKASI' }
    });

    const published = await prisma.laporan.count({
      where: { status: 'DIPUBLIKASIKAN' }
    });

    const totalUser = await prisma.user.count({
      where: { role: 'USER' }
    });

    res.json({
      status: 'success',
      data: { pending, published, totalUser }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * AMBIL SEMUA LAPORAN (ADMIN)
 */
exports.getAllLaporanAdmin = async (req, res) => {
  try {
    const laporan = await prisma.laporan.findMany({
      include: {
        user: {
          select: {
            nama: true,
            no_hp: true
          }
        }
      },
      orderBy: { created_at: 'desc' }
    });

    res.json({ status: 'success', data: laporan });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * VERIFIKASI LAPORAN
 */
exports.verifikasiLaporan = async (req, res) => {
  try {
    const { id } = req.params;
    const { tindakan } = req.body; // SETUJU / TOLAK

    if (!['SETUJU', 'TOLAK'].includes(tindakan)) {
      return res.status(400).json({ message: 'Tindakan tidak valid' });
    }

    const statusBaru =
      tindakan === 'SETUJU'
        ? 'DIPUBLIKASIKAN'
        : 'DITOLAK';

    const laporan = await prisma.laporan.update({
      where: { id: parseInt(id) },
      data: { status: statusBaru }
    });

    res.json({
      status: 'success',
      message: `Laporan berhasil ${statusBaru}`,
      data: laporan
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
