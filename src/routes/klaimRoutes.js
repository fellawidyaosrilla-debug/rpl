const express = require('express');
const router = express.Router();
const klaimController = require('../controllers/klaimController');
const { verifyToken } = require('../middlewares/authMiddleware'); // Wajib Login!
const upload = require('../middlewares/uploadMiddleware');

// POST: Ajukan Klaim
// Body (form-data): id_laporan, bukti_kepemilikan, tgl_hilang, foto (file)
router.post('/', verifyToken, upload.single('foto'), klaimController.ajukanKlaim);

// GET: Lihat Riwayat Klaim Saya
router.get('/saya', verifyToken, klaimController.getKlaimSaya);

// GET: Klaim masuk untuk penemu (owner of the report)
router.get('/masuk', verifyToken, klaimController.getClaimsForOwner);
module.exports = router;