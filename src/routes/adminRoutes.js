const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/stats', verifyToken, isAdmin, adminController.getDashboardStats);
router.get('/laporan', verifyToken, isAdmin, adminController.getAllLaporanAdmin);
router.patch(
  '/laporan/:id/verifikasi',
  verifyToken,
  isAdmin,
  adminController.verifikasiLaporan
);

router.get('/test', (req, res) => {
  res.json({ message: 'admin route ok' });
});


module.exports = router;
console.log('ADMIN ROUTES LOADED');
