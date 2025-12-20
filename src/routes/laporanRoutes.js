const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// 1. Buat Laporan (POST)
router.post('/', verifyToken, upload.single('foto'), laporanController.buatLaporan);

// 2. Ambil Laporan Saya (Penting: Letakkan di atas '/:id')
router.get('/saya', verifyToken, laporanController.getLaporanSaya);

// 3. Ambil Semua Laporan (GET)
router.get('/', laporanController.getAllLaporan);

// 4. Ambil Laporan by ID (GET)
router.get('/:id', laporanController.getLaporanById);

module.exports = router;