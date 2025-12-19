const express = require('express');
const router = express.Router();
const klaimController = require('../controllers/klaimController');
const verifyToken = require('../middlewares/authMiddleware');

// 1. IMPORT MIDDLEWARE UPLOAD
const upload = require('../middlewares/uploadMiddleware'); 

// 2. PASANG "upload.single" DI ROUTE POST
// Artinya: "Sebelum masuk controller, tolong urus file bernama 'foto_bukti' dulu"
router.post('/', verifyToken, upload.single('foto_bukti'), klaimController.ajukanKlaim);

router.get('/notifikasi', verifyToken, klaimController.getNotifikasiSaya);
router.put('/verifikasi', verifyToken, klaimController.verifikasiKlaim);

module.exports = router;