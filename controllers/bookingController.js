const db = require('../config/db');

const bookingController = {
    // 1. CREATE: Membuat Booking Baru
    create: async (req, res) => {
        const { user_id, booking_date, start_time, end_time, total_price } = req.body;

        if (!user_id || !booking_date || !start_time || !end_time || !total_price) {
            return res.status(400).json({ message: "Semua data booking wajib diisi!" });
        }

        try {
            // Cek kalo jam udah ada booking an orang lain di tanggal yang sama (biar gak bentrok)
            const [existing] = await db.query(
                `SELECT * FROM bookings 
                 WHERE booking_date = ? 
                 AND status != 'cancelled'
                 AND ((start_time < ? AND end_time > ?) OR (start_time >= ? AND start_time < ?))`,
                [booking_date, end_time, start_time, start_time, end_time]
            );

            if (existing.length > 0) {
                return res.status(400).json({ message: "Jadwal pada jam tersebut sudah dibooking!" });
            }

            // Jika aman, masukkan ke database
            await db.query(
                'INSERT INTO bookings (user_id, booking_date, start_time, end_time, total_price) VALUES (?, ?, ?, ?, ?)',
                [user_id, booking_date, start_time, end_time, total_price]
            );

            return res.status(201).json({ message: "Booking berhasil dibuat!" });
        } catch (error) {
            return res.status(500).json({ message: "Gagal membuat booking", error: error.message });
        }
    },

    // 2. READ: Ambil Semua Data Booking (Untuk Admin / List Jadwal)
    getAll: async (req, res) => {
        try {
            // Kita JOIN dengan tabel users agar tahu siapa yang booking
            const [rows] = await db.query(
                `SELECT bookings.*, users.name AS user_name 
                 FROM bookings 
                 JOIN users ON bookings.user_id = users.id
                 ORDER BY booking_date DESC, start_time ASC`
            );
            return res.status(200).json(rows);
        } catch (error) {
            return res.status(500).json({ message: "Gagal mengambil data booking", error: error.message });
        }
    },

    // 3. UPDATE: Mengubah Status / Jam Booking
    update: async (req, res) => {
        const { id } = req.params;
        const { booking_date, start_time, end_time, status } = req.body;

        try {
            const [result] = await db.query(
                'UPDATE bookings SET booking_date = ?, start_time = ?, end_time = ?, status = ? WHERE id = ?',
                [booking_date, start_time, end_time, status, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Data booking tidak ditemukan!" });
            }

            return res.status(200).json({ message: "Booking berhasil diperbarui!" });
        } catch (error) {
            return res.status(500).json({ message: "Gagal memperbarui booking", error: error.message });
        }
    },

    // 4. DELETE: Membatalkan/Hapus Data Booking
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