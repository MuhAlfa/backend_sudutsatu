// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const db = require('./config/db'); // Jalur disesuaikan karena db.js sekarang di dalam folder config
const authController = require('./controllers/authController'); // Manggil logika registrasi & login
const bookingController = require('./controllers/bookingController'); // Manggil CRUD booking

dotenv.config();

const app = express(); // ✅ CUKUP SATU KALI DI SINI

app.use(cors());
app.use(express.json()); // Wajib agar server bisa membaca data format JSON dari Postman/Front-End

// 1. ROUTE TES KONEKSI DATABASE
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT NOW() AS waktu_sekarang');
        return res.status(200).json({
            message: "Koneksi ke phpMyAdmin (MySQL) BERHASIL!",
            waktu_database: rows[0].waktu_sekarang
        });
    } catch (error) {
        return res.status(500).json({
            message: "Koneksi database GAGAL!",
            error: error.message
        });
    }
});

// 2. ROUTE AUTENTIKASI USER (REGISTRASI & LOGIN)
app.post('/api/auth/register', authController.register);
app.post('/api/auth/login', authController.login);

// 3. ROUTE CRUD BOOKING
app.post('/api/booking', bookingController.create);      // Membuat pesanan
app.get('/api/booking', bookingController.getAll);       // Melihat semua pesanan
app.put('/api/booking/:id', bookingController.update);   // Mengedit pesanan
app.delete('/api/booking/:id', bookingController.delete); // Menghapus pesanan

// MENJALANKAN SERVER
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server SudutSatu aktif di port ${PORT}`);
});