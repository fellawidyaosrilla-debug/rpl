const pool = require('./database/db');

(async () => {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS db');
    console.log('Berhasil terkoneksi ke database:', rows[0].db);
    process.exit(0);
  } catch (err) {
    console.error('Gagal koneksi:', err.message);
    process.exit(1);
  }
})();
