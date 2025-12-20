const verifyAdmin = (req, res, next) => {
  // req.user ini didapat dari verifyToken sebelumnya
  if (req.user && req.user.role === 'ADMIN') {
    next(); // Silakan lewat bos!
  } else {
    return res.status(403).json({ message: 'Akses Ditolak! Khusus Admin.' });
  }
};

module.exports = verifyAdmin;