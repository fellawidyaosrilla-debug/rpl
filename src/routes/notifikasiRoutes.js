const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middlewares/authMiddleware');
const notifikasiController = require('../controllers/notifikasiController');

router.get('/', verifyToken, notifikasiController.getMyNotifikasi);
router.post('/confirm-claim', verifyToken, notifikasiController.confirmClaim);
router.post('/reject-claim', verifyToken, notifikasiController.rejectClaim);
router.post('/mark-read', verifyToken, notifikasiController.markRead);
router.post('/mark-all-read', verifyToken, notifikasiController.markAllRead);

module.exports = router;