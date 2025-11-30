const express = require('express');
const router = express.Router();
const { tambahBarang } = require('../controllers/barangController');

router.post('/tambah', tambahBarang);

module.exports = router;
