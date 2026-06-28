const db = require('../config/db');

const contactController = {
    // CREATE: Menerima pesan kontak dari form
    sendMessage: async (req, res) => {
        const { name, email, subject, message } = req.body;

        // Validasi data
        if (!name || !email || !subject || !message) {
            return res.status(400).json({ 
                success: false,
                message: "Semua field harus diisi!" 
            });
        }

        try {
            // Insert ke database
            await db.query(
                'INSERT INTO contact_messages (name, email, subject, message, created_at) VALUES (?, ?, ?, ?, NOW())',
                [name, email, subject, message]
            );

            return res.status(201).json({ 
                success: true,
                message: "Pesan Anda berhasil terkirim! Tim kami akan segera merespons." 
            });
        } catch (error) {
            console.error('Error sending message:', error);
            return res.status(500).json({ 
                success: false,
                message: "Gagal mengirim pesan", 
                error: error.message 
            });
        }
    },

    // READ: Ambil semua pesan kontak (untuk admin)
    getAll: async (req, res) => {
        try {
            const [rows] = await db.query(
                'SELECT * FROM contact_messages ORDER BY created_at DESC'
            );
            return res.status(200).json({
                success: true,
                data: rows
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false,
                message: "Gagal mengambil data pesan", 
                error: error.message 
            });
        }
    },

    // DELETE: Hapus pesan kontak
    deleteMessage: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await db.query(
                'DELETE FROM contact_messages WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: "Pesan tidak ditemukan!" 
                });
            }

            return res.status(200).json({ 
                success: true,
                message: "Pesan berhasil dihapus!" 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false,
                message: "Gagal menghapus pesan", 
                error: error.message 
            });
        }
    }
,
    // MARK AS READ: Tandai pesan sudah dibaca
    markRead: async (req, res) => {
        const { id } = req.params;

        try {
            const [result] = await db.query(
                'UPDATE contact_messages SET is_read = 1 WHERE id = ?',
                [id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ 
                    success: false,
                    message: "Pesan tidak ditemukan!" 
                });
            }

            return res.status(200).json({ 
                success: true,
                message: "Pesan ditandai sudah dibaca!" 
            });
        } catch (error) {
            return res.status(500).json({ 
                success: false,
                message: "Gagal menandai pesan", 
                error: error.message 
            });
        }
    }
};

module.exports = contactController;
