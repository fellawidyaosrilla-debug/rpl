const express = require('express');
const router = express.Router();

// Pastikan path ini benar mengarah ke file controller kamu
const klaimController = require('../controllers/klaimController'); 

// Pastikan middleware auth dan upload juga di-import dengan benar
const { verifyToken } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// === ROUTE AJUKAN KLAIM ===
// Error sebelumnya terjadi di baris bawah ini karena klaimController.ajukanKlaim tidak terbaca
router.post('/', verifyToken, upload.single('foto_bukti'), klaimController.ajukanKlaim);

module.exports = router;