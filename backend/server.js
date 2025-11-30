require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ROUTES (letakkan sebelum listen)
const authRoutes = require('./routes/authRoutes');
app.use('/auth', authRoutes);

// healthcheck
app.get('/', (req, res) => {
  res.json({ ok: true, message: 'Server Temu Cepat - backend aktif' });
});

const barangRoutes = require("./routes/barangRoutes");
app.use("/barang", barangRoutes);

const pelaporRoutes = require('./routes/pelaporRoutes');
app.use('/pelapor', pelaporRoutes);

// START SERVER
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server jalan di port ${PORT}`));

