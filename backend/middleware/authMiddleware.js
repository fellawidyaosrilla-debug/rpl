const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: "Token wajib dikirim" });
    }

    // format token: "Bearer <token>"
    const token = authHeader.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: "Token tidak valid" });
    }

    try {
        const decoded = jwt.verify(token, "TEMUCEPAT_SECRET");
        req.user = decoded; // simpan data user ke request
        next(); // lanjut
    } catch (error) {
        console.log(error);
        return res.status(401).json({ error: "Token tidak valid atau expired" });
    }
};
