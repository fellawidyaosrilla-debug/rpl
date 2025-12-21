const express = require('express');
const router = express.Router();
const laporanController = require('../controllers/laporanController');
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// === A. ROUTE STATIS (Harus di Paling Atas) ===

// 1. Ambil Semua Laporan PUBLIK (Untuk Beranda - Hanya yang sudah dipublikasikan)
router.get('/', laporanController.getAllLaporan);

// 2. Statistik Dashboard (Admin)
router.get('/stats/dashboard', verifyToken, laporanController.getDashboardStats);

// 3. Aktivitas Terbaru (Admin)
router.get('/stats/recent', verifyToken, laporanController.getRecentActivity);

// 4. Laporan Saya (User Login)
router.get('/saya', verifyToken, laporanController.getLaporanSaya);

// === 5. AMBIL SEMUA LAPORAN (KHUSUS ADMIN) ===
// PENTING: Route ini mengambil SEMUA status (Pending, Ditolak, Dipublikasikan)
// Harus ditaruh sebelum route '/:id'
router.get('/semua', verifyToken, laporanController.getSemuaLaporan);

// === B. ROUTE AKSI (POST/PATCH) ===

// 6. Buat Laporan Baru
router.post('/', verifyToken, upload.single('foto'), laporanController.buatLaporan);

// 7. Verifikasi Laporan (Admin)
router.patch('/:id/verifikasi', verifyToken, laporanController.verifikasiLaporan);

// === C. ROUTE DINAMIS (Harus Paling Bawah) ===

// 8. Detail Laporan by ID
// PENTING: ':id' akan menangkap teks apa saja setelah slash.
// Jangan taruh route statis di bawah baris ini.
router.get('/:id', laporanController.getDetailLaporan);

module.exports = router;