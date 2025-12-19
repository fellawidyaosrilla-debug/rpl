const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const app = express();

// --- MIDDLEWARES ---
app.use(helmet());      // Security Header
app.use(cors());        // Allow Frontend access
app.use(morgan('dev')); // Logging request
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true }));


const path = require('path');
// Buka folder uploads supaya bisa diakses publik
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
// --- ROUTES ---

// 1. Health Check (Cek server hidup/mati)
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Halo! Backend TemuCepat Ready.',
    timestamp: new Date()
  });
});

// 2. REGISTER ROUTES DISINI (Sebelum Error Handler)
// Supaya request dicek dulu di sini, kalau tidak ada baru ke 404.
const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

const laporanRoutes = require('./routes/laporanRoutes');
app.use('/api/laporan', laporanRoutes);

const klaimRoutes = require('./routes/klaimRoutes');
app.use('/api/interaksi', klaimRoutes);

// 3. 404 Handler (Pintu Terakhir)
// Jika tidak ada route yang cocok di atas, baru masuk ke sini.
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Route not found'
  });
});

module.exports = app;