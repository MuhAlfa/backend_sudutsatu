// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret';
const USER_TABLE = 'users';

// Middleware untuk memverifikasi token dan mengambil data user
const protect = async (req, res, next) => {
    let token;

    // Cek apakah ada token di header Authorization, dan formatnya 'Bearer <token>'
    // 1) Periksa header Authorization 'Bearer token'
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
        } catch (err) {
            return res.status(401).json({ message: 'Token header tidak valid.' });
        }
    }

    // 2) Jika tidak ada di header, periksa cookie HttpOnly 'token'
    if (!token && req.cookies && req.cookies.token) {
        token = req.cookies.token;
    }

    if (!token) {
        console.warn('[auth] no token present for request', req.originalUrl);
        return res.status(401).json({ message: 'Silakan login terlebih dahulu.' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        const [users] = await db.query(`SELECT id, name, email, phone, role FROM ${USER_TABLE} WHERE id = ?`, [decoded.id]);
        if (users.length === 0) {
            console.warn('[auth] user id from token not found', decoded.id);
            return res.status(401).json({ message: 'User tidak ditemukan.' });
        }
        req.user = users[0];
        next();
    } catch (error) {
        console.error('[auth] token verify error for request', req.originalUrl, error.message || error);
        return res.status(401).json({ message: 'Sesi login tidak valid atau telah kedaluwarsa.' });
    }
};

// Middleware untuk membatasi akses hanya untuk role tertentu (misal: admin)
const restrictTo = (...roles) => {
    return (req, res, next) => {
        // Cek apakah role user yang login ada di dalam daftar roles yang diizinkan
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Anda tidak memiliki hak untuk mengakses sumber daya ini.' });
        }
        next(); // Jika diizinkan, lanjutkan
    };
};

module.exports = { protect, restrictTo };
