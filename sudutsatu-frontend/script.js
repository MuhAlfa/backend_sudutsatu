document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:5000/api';

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
                body: JSON.stringify(dataLogin)
            })
            .then(res => res.json())
            .then(result => {
                if (result.token) {
                    alert("Login Berhasil!");
                    localStorage.setItem('token', result.token);
                    localStorage.setItem('user_id', result.user.id);
                    window.location.href = '../../dashboard-user.html'; // Sesuaikan arah foldernya
                } else {
                    alert(result.message || "Login Gagal!");
                }
            })
            .catch(err => console.error("Error Login:", err));
        });
    }
});