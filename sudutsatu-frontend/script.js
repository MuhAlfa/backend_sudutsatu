document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = window.location.hostname === '127.0.0.1'
        ? 'http://127.0.0.1:5000/api'
        : 'http://localhost:5000/api';

    // ==========================================
    // 1. LOGIKA UNTUK HALAMAN REGISTER (DISESUAIKAN DENGAN HTML)
    // ==========================================
    const formRegister = document.getElementById('registerForm'); // Sesuai id="registerForm"
    if (formRegister) {
        formRegister.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('password').value; // Sesuai id="password"
            const confirmPassword = document.getElementById('confirmPassword').value; // Sesuai id="confirmPassword"

            // Validasi kecocokan password
            if (password !== confirmPassword) {
                alert("Konfirmasi password tidak cocok!");
                return;
            }

            const dataRegister = {
                name: document.getElementById('fullName').value, // Sesuai id="fullName"
                email: document.getElementById('email').value,    // Sesuai id="email"
                phone: document.getElementById('phone').value,
                password: password
                // Jika database kamu nanti butuh nomor telepon, bisa tambahkan: 
                // phone: document.getElementById('phone').value
            };

            console.log("Mengirim data registrasi ke backend...", dataRegister);

            fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataRegister)
            })
            .then(async res => {
                const result = await res.json();
                alert(result.message);
                
                if (res.status === 201 || result.message === "User berhasil terdaftar!") {
                    window.location.href = 'login.html'; 
                }
            })
            .catch(err => {
                console.error("Error Register:", err);
                alert("Gagal terhubung ke server backend! Pastikan node server.js menyala.");
            });
        });
    }

    // ==========================================
    // 2. LOGIKA UNTUK HALAMAN LOGIN (DISESUAIKAN)
    // ==========================================
    // Catatan: Cek file login.html nanti, jika id form mereka berbeda, samakan di sini
    const formLogin = document.getElementById('loginForm') || document.getElementById('form-login');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();

            const dataLogin = {
                email: document.getElementById('email').value, 
                password: document.getElementById('password').value
            };

            fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dataLogin),
                credentials: 'include'
            })
            .then(async res => {
                const result = await res.json();
                if (res.ok) {
                    alert(result.message || "Login Berhasil!");
                    // Server sets HttpOnly cookie; do not store token client-side
                    window.location.href = '../../dashboard-user.html';
                } else {
                    alert(result.message || "Login Gagal!");
                }
            })
            .catch(err => {
                console.error("Error Login:", err);
                alert("Login gagal, periksa koneksi server.");
            });
        });
    }
});