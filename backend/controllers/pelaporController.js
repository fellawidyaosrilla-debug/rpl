const db = require('../database/db');

exports.tambahPelapor = (req, res) => {
    const { nama_pelapor, kontak_pelapor } = req.body;

    if (!nama_pelapor || !kontak_pelapor) {
        return res.status(400).json({ error: 'Semua field harus diisi' });
    }

    const sql = "INSERT INTO pelapor (nama_pelapor, kontak_pelapor) VALUES (?, ?)";

    db.query(sql, [nama_pelapor, kontak_pelapor], (err, result) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Database error' });
        }

        res.json({
            message: "Pelapor berhasil ditambahkan",
            id_pelapor: result.insertId
        });
    });
};
