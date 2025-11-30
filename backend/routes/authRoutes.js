const express = require('express');
const router = express.Router();

const { register, login } = require('../controllers/authController');

const auth = require('../middleware/authMiddleware');

router.get('/protected', auth, (req, res) => {
    res.json({
        message: "Route ini hanya bisa diakses oleh user yang login!",
        user: req.user
    });
});


router.post('/register', register);
router.post('/login', login);

router.get('/test', (req, res) => {
    res.send("ROUTE AUTH BERHASIL TERBACA");
});

module.exports = router;
