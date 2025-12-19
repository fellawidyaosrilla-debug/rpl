const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const verifyToken = require('../middlewares/authMiddleware'); // Satpam Token
const upload = require('../middlewares/uploadMiddleware');    // Handle Foto

// POST /api/laporan
// Alur: Cek Token -> Upload Foto -> Jalankan Logic Controller
router.post('/', 
  verifyToken, 
  upload.single('foto_barang'), // 'foto_barang' adalah nama field di Postman nanti
  laporanController.createLaporan
);

// GET /api/laporan
// Bisa diakses publik (tanpa token) untuk melihat beranda
router.get('/', laporanController.getAllLaporan);

module.exports = router;