// ==================================================
// PAGE: AUTH.JS (Simulasi Login & Register)
// ==================================================

document.addEventListener('DOMContentLoaded', () => {
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');

  // --- Handle Login ---
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = document.getElementById('email').value;
      
      // Simulasi Pemeriksaan Role berdasarkan email
      // Di sistem asli, ini akan di-handle oleh Backend JWT/Session
      if (email === 'admin@sudutsatu.com') {
        // Simpan sesi admin di localStorage
        localStorage.setItem('userSession', JSON.stringify({ role: 'admin', name: 'Super Admin' }));
        alert('Login Admin Berhasil!');
        // Arahkan ke Dashboard Admin
        window.location.href = '../admin/admin-dashboard.html';
      } else {
        // Simpan sesi user biasa di localStorage
        localStorage.setItem('userSession', JSON.stringify({ role: 'user', name: email.split('@')[0] }));
        alert('Login Berhasil!');
        // Arahkan ke Landing Page / User Dashboard
        window.location.href = '../../index.html';
      }
    });
  }

  // --- Handle Register ---
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Pendaftaran berhasil! Silakan masuk dengan akun baru Anda.');
      window.location.href = 'login.html';
    });
  }

  // --- Handle Forgot Password ---
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Tautan reset password telah dikirim ke email Anda.');
      window.location.href = 'login.html';
    });
  }

});