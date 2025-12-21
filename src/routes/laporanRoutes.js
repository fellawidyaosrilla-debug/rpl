const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const klaimController = require('../controllers/klaimController');
// 1. Buat Laporan (POST)
router.post('/', verifyToken, upload.single('foto'), laporanController.buatLaporan);

// 2. Ambil Laporan Saya
router.get('/saya', verifyToken, laporanController.getLaporanSaya);

// 3. Ambil Semua Laporan
router.get('/', laporanController.getAllLaporan);

// === TAMBAHAN BARU: Route Verifikasi ===
// Pastikan fungsi verifikasiLaporan sudah ada di controller (Langkah 1)
router.patch('/:id/verifikasi', verifyToken, laporanController.verifikasiLaporan);

// 4. Ambil Laporan by ID
router.get('/:id', laporanController.getLaporanById);

router.get('/stats/recent', verifyToken, laporanController.getRecentActivity);

router.post('/klaim', verifyToken, upload.single('foto_bukti'), klaimController.ajukanKlaim);

router.get('/stats/dashboard', verifyToken, laporanController.getDashboardStats);

module.exports = router;