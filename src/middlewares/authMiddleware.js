const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'kunci_rahasia_temucepat';

const verifyToken = (req, res, next) => {
  // 1. Ambil token dari Header (Authorization: Bearer <token>)
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(403).json({ message: 'Akses ditolak! Token tidak ditemukan.' });
  }

  // Ambil kata kedua setelah "Bearer"
  const token = authHeader.split(' ')[1]; 

  if (!token) {
    return res.status(403).json({ message: 'Format token salah!' });
  }

  // 2. Cek keaslian token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token tidak valid atau kadaluarsa!' });
    }

    // 3. Simpan data user (ID & Role) ke dalam request
    req.user = decoded; 
    next(); // Lanjut ke controller
  });
};

module.exports = verifyToken;