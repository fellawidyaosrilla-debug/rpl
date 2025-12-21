const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notifikasiController');
const { verifyToken } = require('../middlewares/authMiddleware');

router.get('/', verifyToken, notifController.getMyNotif);
router.post('/read', verifyToken, notifController.markAsRead);

module.exports = router;