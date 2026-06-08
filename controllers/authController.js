// controllers/authController.js
const db = require('../config/db'); // Menyesuaikan jalur ke db.js di folder config
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 1. LOGIKA DAFTAR (REGISTER)
exports.register = async (req, res) => {
    const { name, email, password } = req.body;

    try {
        // Cek apakah email sudah pernah terdaftar di database
        const [existingUser] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar!' });
        }

        // Amankan password: acak password asli menggunakan bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Masukkan data user baru ke tabel phpMyAdmin
        await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, 'user']
        );

        return res.status(201).json({ message: 'User berhasil didaftarkan!' });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// 2. LOGIKA MASUK (LOGIN)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Cari user berdasarkan emailnya
        const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        const user = users[0];

        // Bandingkan password yang diketik dengan password terenkripsi di database
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        // Buat Token JWT sebagai kunci akses digital bagi user tersebut
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' } // Token berlaku selama 1 hari
        );

        return res.status(200).json({
            message: 'Selamat, login berhasil!',
            token,
            user: { id: user.id, name: user.name, role: user.role }
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};