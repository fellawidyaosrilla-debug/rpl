const db = require('../database/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { username, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const sql = "INSERT INTO users (username, password) VALUES (?, ?)";
        db.query(sql, [username, hashedPassword], (err, result) => {
            if (err) {
                console.log(err);
                return res.status(500).json({ error: 'Database error' });
            }

            res.json({ message: 'Register berhasil', userId: result.insertId });
        });

    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = (req, res) => {
    const { username, password } = req.body;

    const sql = "SELECT * FROM users WHERE username = ?";
    db.query(sql, [username], async (err, rows) => {
        if (err) {
            console.log(err);
            return res.status(500).json({ error: 'Database error' });
        }

        if (rows.length === 0) {
            return res.status(400).json({ error: "User tidak ditemukan" });
        }

        const user = rows[0];

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: "Password salah" });
        }

        // generate token
        const token = jwt.sign(
            { userId: user.id, username: user.username },
            "TEMUCEPAT_SECRET", // nanti kita pindah ke .env
            { expiresIn: "1d" }
        );

        res.json({
            message: "Login berhasil",
            token: token,
            user: { id: user.id, username: user.username }
        });
    });
};
