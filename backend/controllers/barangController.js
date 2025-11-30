const db = require('../database/db');

exports.tambahBarang = (req, res) => {
    const { nama_barang, ciri_barang, foto_barang } = req.body;

    if (!nama_barang || !ciri_barang || !foto_barang) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    const sql = "INSERT INTO barang (nama_barang, ciri_barang, foto_barang) VALUES (?, ?, ?)";

    db.query(sql, [nama_barang, ciri_barang, foto_barang], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({
            message: 'Barang berhasil ditambahkan',
            id_barang: result.insertId
        });
    });
};
