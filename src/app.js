const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const app = express();

// --- 1. GLOBAL MIDDLEWARES ---
app.use(helmet({
    crossOriginResourcePolicy: false, // Penting agar gambar uploads bisa tampil di frontend
}));
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- 2. STATIC FILES (Folder Foto) ---
// Menggunakan process.cwd() agar merujuk ke folder 'uploads' di root project
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// --- 3. ROUTES ---

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Halo! Backend TemuCepat Ready.',
    timestamp: new Date()
  });
});

// Import & Gunakan Routes
const authRoutes = require('./routes/authRoutes');
const laporanRoutes = require('./routes/laporanRoutes');
const klaimRoutes = require('./routes/klaimRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notifikasiRoutes = require('./routes/notifikasiRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/laporan', laporanRoutes);
app.use('/api/klaim', klaimRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifikasi', notifikasiRoutes);

// --- 4. ERROR HANDLER ---

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route tidak ditemukan'
  });
});

// Global Error Handler (Opsional tapi bagus untuk mencegah server mati total)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Terjadi kesalahan pada server interna;'
  });
});

module.exports = app;