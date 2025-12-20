const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ message: "Token Hilang" });

    // Gunakan fallback secret yang sama seperti di login jika ENV tidak diset
    const secret = process.env.JWT_SECRET || 'temu_cepat_secret_key_2025';

    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(403).json({ message: "Token Tidak Valid", error: err.message });
        
        // Simpan data user hasil decode (id & role) ke req.user
        req.user = decoded; 
        next();
    });
};

exports.isAdmin = (req, res, next) => {
    // Mengecek apakah role yang dibawa token adalah ADMIN
    if (req.user && req.user.role === 'ADMIN') {
        next();
    } else {
        return res.status(403).json({ 
            message: "Akses Ditolak: Role Anda bukan ADMIN!",
            currentRole: req.user ? req.user.role : 'Tidak Ada'
        });
    }
};