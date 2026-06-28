const db = require('../config/db');

const bookingController = {
    // 1. CREATE: Membuat Booking Baru
    create: async (req, res) => {
        // user_id diambil dari middleware 'protect'
        const user_id = req.user.id; 
        
        // Ambil data lain dari body request
        const { venue_name, team_name, booking_date, start_time, end_time, total_price, payment_method, payment_proof } = req.body;

        if (!user_id || !venue_name || !team_name || !booking_date || !start_time || !end_time || !total_price) {
            return res.status(400).json({ message: "Semua data booking (termasuk user_id, venue_name, dan team_name) wajib diisi!" });
        }

        try {
            // Cek jadwal bentrok
            const [existing] = await db.query(
                `SELECT * FROM bookings 
                 WHERE booking_date = ? AND status NOT IN ('cancelled', 'failed')
                 AND ((start_time < ? AND end_time > ?) OR (start_time >= ? AND start_time < ?))`,
                [booking_date, end_time, start_time, start_time, end_time]
            );

            if (existing.length > 0) {
                return res.status(400).json({ message: "Jadwal pada jam tersebut sudah dibooking!" });
            }

            // Simpan ke database dengan status verifikasi pembayaran
            const [result] = await db.query(
                'INSERT INTO bookings (user_id, venue_name, team_name, booking_date, start_time, end_time, total_price, status, payment_method, payment_proof) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [user_id, venue_name, team_name, booking_date, start_time, end_time, total_price, 'pending_verification', payment_method || null, payment_proof || null]
            );
            
            const newBookingId = result.insertId;

            return res.status(201).json({ 
                message: "Booking berhasil dibuat! Silakan lanjutkan ke pembayaran.",
                bookingId: newBookingId
            });
        } catch (error) {
            console.error("Error creating booking:", error);
            return res.status(500).json({ message: "Gagal membuat booking", error: error.message });
        }
    },

    // 2. READ: Ambil Semua Data Booking (Untuk Admin)
    getAll: async (req, res) => {
        try {
            const [rows] = await db.query(
                `SELECT b.*, u.name AS user_name, u.email AS user_email 
                 FROM bookings b 
                 JOIN users u ON b.user_id = u.id
                 ORDER BY b.booking_date DESC, b.start_time ASC`
            );
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            return res.status(500).json({ message: "Gagal mengambil data booking", error: error.message });
        }
    },
    
    // 3. READ: Ambil semua booking milik SATU user (Untuk Riwayat Pesanan)
    getUserBookings: async (req, res) => {
        const userId = req.user.id; // Ambil ID user dari token (setelah lewat middleware 'protect')
        try {
            const [rows] = await db.query(
                `SELECT * FROM bookings 
                 WHERE user_id = ? 
                 ORDER BY booking_date DESC, start_time ASC`,
                [userId]
            );
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            return res.status(500).json({ message: "Gagal mengambil riwayat booking", error: error.message });
        }
    },

    // 4. READ: Ambil booking by id untuk user atau admin
    getBookingById: async (req, res) => {
        const { id } = req.params;
        try {
            const [rows] = await db.query(
                `SELECT b.*, u.name AS user_name, u.email AS user_email, u.phone AS user_phone
                 FROM bookings b
                 JOIN users u ON b.user_id = u.id
                 WHERE b.id = ?`,
                [id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ message: "Booking tidak ditemukan." });
            }

            const booking = rows[0];
            if (req.user.role !== 'admin' && booking.user_id !== req.user.id) {
                return res.status(403).json({ message: "Anda tidak diizinkan melihat booking ini." });
            }

            return res.status(200).json({ success: true, data: booking });
        } catch (error) {
            console.error("Error getting booking by id:", error);
            return res.status(500).json({ message: "Gagal mengambil booking", error: error.message });
        }
    },

    // 5. READ: Ambil jadwal terbook untuk venue+tanggal
    getAvailability: async (req, res) => {
        const { venue_name, booking_date } = req.query;
        if (!venue_name || !booking_date) {
            return res.status(400).json({ message: "Parameter venue_name dan booking_date wajib diberikan." });
        }

        try {
            const [rows] = await db.query(
                `SELECT id, venue_name, booking_date, start_time, end_time, status
                 FROM bookings
                 WHERE venue_name = ? AND booking_date = ?
                   AND status NOT IN ('cancelled', 'failed')
                 ORDER BY start_time ASC`,
                [venue_name, booking_date]
            );
            return res.status(200).json({ success: true, data: rows });
        } catch (error) {
            console.error("Error getting availability:", error);
            return res.status(500).json({ message: "Gagal mengambil jadwal tersedia", error: error.message });
        }
    },

    // 6. UPDATE: Mengubah Status / Data Booking (Untuk Admin & Proses Pembayaran)
    update: async (req, res) => {
        const { id } = req.params;
        const updateFields = req.body; // { status: "confirmed", payment_method: "BCA" }

        // Hapus field yang tidak boleh diubah sembarangan
        delete updateFields.id;
        delete updateFields.user_id;
        delete updateFields.created_at;

        if (Object.keys(updateFields).length === 0) {
            return res.status(400).json({ message: 'Tidak ada data untuk diperbarui.' });
        }

        const setClause = Object.keys(updateFields).map(key => `\`${key}\` = ?`).join(', ');
        const values = Object.values(updateFields);

        try {
            const [result] = await db.query(
                `UPDATE bookings SET ${setClause} WHERE id = ?`,
                [...values, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Data booking tidak ditemukan!" });
            }

            return res.status(200).json({ message: "Booking berhasil diperbarui!" });
        } catch (error) {
            console.error("Error updating booking:", error);
            return res.status(500).json({ message: "Gagal memperbarui booking", error: error.message });
        }
    },

    // 5. DELETE: Membatalkan/Hapus Data Booking (Untuk Admin)
    delete: async (req, res) => {
        const { id } = req.params;
        try {
            const [result] = await db.query('DELETE FROM bookings WHERE id = ?', [id]);
            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Data booking tidak ditemukan!" });
            }
            return res.status(200).json({ message: "Booking berhasil dihapus dari sistem!" });
        } catch (error) {
            return res.status(500).json({ message: "Gagal menghapus booking", error: error.message });
        }
    }
};

module.exports = bookingController;