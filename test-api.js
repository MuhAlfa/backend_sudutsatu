/**
 * TEST SCRIPT - Contact Form API
 * Jalankan di DevTools Console atau Node.js
 * 
 * Gunakan untuk testing endpoint /api/contact
 */

// =========================================
// 1. TEST POST - Kirim Pesan Kontak
// =========================================
const testSendMessage = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: 'Test User',
                email: 'test@example.com',
                subject: 'Test Subject',
                message: 'Ini adalah pesan test dari script'
            })
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

// =========================================
// 2. TEST GET - Ambil Semua Pesan
// =========================================
const testGetMessages = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/contact', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Messages:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

// =========================================
// 3. TEST DELETE - Hapus Pesan
// =========================================
const testDeleteMessage = async (id) => {
    try {
        const response = await fetch(`http://localhost:5000/api/contact/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const data = await response.json();
        console.log('Status:', response.status);
        console.log('Response:', data);
        return data;
    } catch (error) {
        console.error('Error:', error);
    }
};

// =========================================
// CARA PAKAI:
// =========================================
// Di Browser Console (F12):
// 1. Kirim pesan: testSendMessage()
// 2. Lihat semua: testGetMessages()
// 3. Hapus (ID 1): testDeleteMessage(1)
//
// Di Node.js Terminal:
// node -e "require('./test-api.js').testSendMessage()"

module.exports = {
    testSendMessage,
    testGetMessages,
    testDeleteMessage
};
