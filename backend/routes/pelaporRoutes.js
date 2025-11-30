const express = require('express');
const router = express.Router();
const { tambahPelapor } = require('../controllers/pelaporController');

router.post('/tambah', tambahPelapor);

module.exports = router;
