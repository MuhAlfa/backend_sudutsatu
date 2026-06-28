// controllers/authController.js
const db = require('../config/db'); // Menyesuaikan jalur ke db.js di folder config
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret';
const USER_TABLE = 'users';

// 1. LOGIKA DAFTAR (REGISTER)
exports.register = async (req, res) => {
    // Tambahkan 'phone' agar ikut ditangkap dari request body front-end
    const { name, email, phone, password } = req.body;

    try {
        console.log('[auth] register attempt for', email);
        // Cek apakah email sudah pernah terdaftar di database
        const [existingUser] = await db.query(`SELECT id FROM ${USER_TABLE} WHERE email = ?`, [email]);
        if (existingUser.length > 0) {
            return res.status(400).json({ message: 'Email sudah terdaftar!' });
        }

        // Amankan password: acak password asli menggunakan bcrypt
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Masukkan data user baru ke tabel phpMyAdmin (Disisipkan kolom phone)
        await db.query(
            `INSERT INTO ${USER_TABLE} (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)`,
            [name, email, phone, hashedPassword, 'user'] // Urutan array harus sama dengan tanda tanya (?) di atas
        );

        console.log('[auth] register success for', email);
        return res.status(201).json({ message: 'User berhasil didaftarkan!' });
    } catch (error) {
        console.error('[auth] register error:', error.message || error);
        return res.status(500).json({ error: error.message });
    }
};

// 2. LOGIKA MASUK (LOGIN)
exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log('[auth] login attempt for', email);
        const normalizedEmail = (email || '').trim().toLowerCase();

        const [users] = await db.query(`SELECT * FROM ${USER_TABLE} WHERE email = ?`, [normalizedEmail]);
        if (users.length === 0) {
            console.warn('[auth] login failed - user not found', email);
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        const user = users[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.warn('[auth] login failed - invalid password for', email);
            return res.status(400).json({ message: 'Email atau password salah!' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, email: user.email, name: user.name },
            JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000,
            path: '/'
        });

        console.log('[auth] login success for', email, 'role=', user.role);
        return res.status(200).json({
            message: 'Selamat, login berhasil!',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                phone: user.phone,
                role: user.role
            }
        });
    } catch (error) {
        console.error('[auth] login error:', error.message || error);
        return res.status(500).json({ error: error.message });
    }
};

exports.logout = async (req, res) => {
    try {
        console.log('[auth] logout request for', req.user ? req.user.email : 'unknown');
        res.clearCookie('token', { path: '/' });
        return res.status(200).json({ message: 'Berhasil logout' });
    } catch (err) {
        console.error('[auth] logout error:', err.message || err);
        return res.status(500).json({ error: err.message });
    }
};

exports.me = async (req, res) => {
    console.log('[auth] me requested for', req.user ? req.user.email : 'unauthenticated');
    return res.status(200).json({ user: req.user });
};