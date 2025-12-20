const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');

// Import middleware untuk keamanan
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

// === SEMUA ROUTE ADMIN WAJIB LOGIN DAN ROLE ADMIN ===

// 1. Ambil data statistik untuk kotak-kotak dashboard
router.get('/stats', verifyToken, isAdmin, adminController.getDashboardStats);

// 2. Ambil semua daftar laporan untuk tabel verifikasi
router.get('/laporan', verifyToken, isAdmin, adminController.getAllLaporanAdmin);

// 3. Proses Verifikasi (Terima/Tolak Laporan)
router.patch('/verifikasi/:id_laporan', verifyToken, isAdmin, adminController.verifikasiLaporan);

module.exports = router;