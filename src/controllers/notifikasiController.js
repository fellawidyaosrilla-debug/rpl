// src/controllers/notifikasiController.js

/**
 * Ambil notifikasi milik user yang sedang login
 */
const getNotifSaya = async (req, res) => {
  try {
    const userId = req.user.id; // dari verifyToken

    // TODO: ganti dengan query database kamu
    const notifikasi = [
      {
        id: 1,
        title: 'Pengajuan Klaim',
        message: 'Pengajuan klaim kamu sedang diproses',
        isRead: false,
      },
    ];

    res.status(200).json({
      success: true,
      data: notifikasi,
    });
  } catch (error) {
    console.error('getNotifSaya error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal mengambil notifikasi',
    });
  }
};

/**
 * Konfirmasi klaim
 */
const confirmClaim = async (req, res) => {
  try {
    const { claimId } = req.body;

    if (!claimId) {
      return res.status(400).json({
        success: false,
        message: 'claimId wajib diisi',
      });
    }

    // TODO: update status klaim di database
    res.status(200).json({
      success: true,
      message: 'Klaim berhasil dikonfirmasi',
    });
  } catch (error) {
    console.error('confirmClaim error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal konfirmasi klaim',
    });
  }
};

/**
 * Tolak klaim
 */
const rejectClaim = async (req, res) => {
  try {
    const { claimId, reason } = req.body;

    if (!claimId) {
      return res.status(400).json({
        success: false,
        message: 'claimId wajib diisi',
      });
    }

    // TODO: update status klaim + alasan penolakan
    res.status(200).json({
      success: true,
      message: 'Klaim berhasil ditolak',
    });
  } catch (error) {
    console.error('rejectClaim error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menolak klaim',
    });
  }
};

/**
 * Tandai satu notifikasi sebagai sudah dibaca
 */
const markRead = async (req, res) => {
  try {
    const { notifId } = req.body;

    if (!notifId) {
      return res.status(400).json({
        success: false,
        message: 'notifId wajib diisi',
      });
    }

    // TODO: update is_read = true di database
    res.status(200).json({
      success: true,
      message: 'Notifikasi ditandai sudah dibaca',
    });
  } catch (error) {
    console.error('markRead error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menandai notifikasi',
    });
  }
};

/**
 * Tandai semua notifikasi user sebagai sudah dibaca
 */
const markAllRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // TODO: update semua notifikasi user
    res.status(200).json({
      success: true,
      message: 'Semua notifikasi ditandai sudah dibaca',
    });
  } catch (error) {
    console.error('markAllRead error:', error);
    res.status(500).json({
      success: false,
      message: 'Gagal menandai semua notifikasi',
    });
  }
};

module.exports = {
  getNotifSaya,
  confirmClaim,
  rejectClaim,
  markRead,
  markAllRead,
};
