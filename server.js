// server.js
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const db = require('./config/db'); // Jalur disesuaikan karena db.js sekarang di dalam folder config
const authController = require('./controllers/authController'); // Manggil logika registrasi & login
const bookingController = require('./controllers/bookingController'); // Manggil CRUD booking
const contactController = require('./controllers/contactController'); // Manggil CRUD contact messages
const { protect } = require('./middlewares/authMiddleware');

dotenv.config();

const app = express();

// Konfigurasi CORS - Allow frontend dari berbagai origin
const allowedOrigins = ['http://localhost:3000', 'http://127.0.0.1:5500', 'http://localhost:5500', 'http://localhost:8080'];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Origin not allowed by CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json()); // Wajib agar server bisa membaca data format JSON dari Postman/Front-End
app.use(express.urlencoded({ extended: true })); // Support form URL-encoded
// HTTP request logger
app.use(morgan('dev'));
const cookieParser = require('cookie-parser');
app.use(cookieParser());

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
app.post('/api/auth/logout', authController.logout);
app.get('/api/auth/me', protect, authController.me);

// 3. ROUTE CRUD BOOKING
app.post('/api/booking', protect, bookingController.create);      // Membuat pesanan
app.get('/api/booking', protect, bookingController.getAll);       // Melihat semua pesanan
app.get('/api/booking/my-bookings', protect, bookingController.getUserBookings); // Riwayat booking user
app.get('/api/booking/availability', protect, bookingController.getAvailability); // Jadwal terbook per venue & tanggal
app.get('/api/booking/:id', protect, bookingController.getBookingById); // Detail booking per id
app.put('/api/booking/:id', protect, bookingController.update);   // Mengedit pesanan
app.delete('/api/booking/:id', protect, bookingController.delete); // Menghapus pesanan

// 4. ROUTE CONTACT MESSAGES (Form Hubungi Kami)
app.post('/api/contact', contactController.sendMessage); // Mengirim pesan kontak
app.get('/api/contact', contactController.getAll);       // Melihat semua pesan (admin)
app.delete('/api/contact/:id', contactController.deleteMessage); // Menghapus pesan
app.put('/api/contact/:id/read', contactController.markRead);   // Tandai pesan sudah dibaca

// MENJALANKAN SERVER (hanya saat dijalankan langsung)
const PORT = process.env.PORT || 5000;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server SudutSatu aktif di port ${PORT}`);
    });
}

module.exports = app;