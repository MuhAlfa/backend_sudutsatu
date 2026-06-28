// AUTH.JS - Lightweight, robust auth page helpers (uses API_BASE_URL)

document.addEventListener('DOMContentLoaded', () => {
  const API_BASE_URL = window.location.hostname === '127.0.0.1' || window.location.hostname === 'localhost'
    ? `http://${window.location.hostname}:5000/api`
    : 'http://localhost:5000/api';

  const authNavbarContainer = document.getElementById('authNavbarContainer');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const forgotForm = document.getElementById('forgotForm');

  // Build navbar HTML based on session
  const buildNavbar = (user) => {
    const navLinks = '<a href="../../search-venues.html" class="nav-link">Cari Lapangan</a>' +
                     '<a href="../../tentang-kami.html" class="nav-link">Tentang Kami</a>' +
                     '<a href="../../hubungi-kami.html" class="nav-link">Hubungi Kami</a>';

    let actions = '';
    if (user && user.role === 'admin') {
      actions = '<a href="../../admin-dashboard.html" class="btn btn-text">Admin Dashboard</a>' +
                '<button id="authLogoutBtn" class="btn btn-primary">Keluar</button>';
    } else if (user) {
      actions = '<a href="../../dashboard-user.html" class="btn btn-text">Dashboard</a>' +
                '<button id="authLogoutBtn" class="btn btn-primary">Keluar</button>';
    } else {
      actions = '<a href="login.html" class="btn btn-text">Masuk</a>' +
                '<a href="register.html" class="btn btn-primary">Daftar</a>';
    }

    authNavbarContainer.innerHTML =
      '<div class="auth-navbar">' +
        '<div class="auth-navbar-inner">' +
          '<div class="auth-logo"><span class="text-primary">Sudut</span>Satu</div>' +
          '<div class="auth-links">' + navLinks + '</div>' +
          '<div class="auth-actions">' + actions + '</div>' +
        '</div>' +
      '</div>';

    const logoutBtn = document.getElementById('authLogoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST', credentials: 'include' })
          .catch(() => null)
          .then(() => { window.location.href = 'login.html'; });
      });
    }
  };

  // Check session and render navbar only if navbar container exists
  if (authNavbarContainer) {
    (async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/me`, { method: 'GET', credentials: 'include' });
        if (!res.ok) {
          buildNavbar(null);
          return;
        }
        const payload = await res.json().catch(() => ({}));
        buildNavbar(payload.user || null);
      } catch (err) {
        buildNavbar(null);
      }
    })();
  }

  // --- LOGIN ---
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const dataLogin = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
      };

      try {
        const res = await fetch(`${API_BASE_URL}/auth/login`, {
          method: 'POST', headers: { 'Content-Type': 'application/json' }, credentials: 'include', body: JSON.stringify(dataLogin)
        });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Login gagal');
        alert(result.message || 'Login berhasil');
        if (result.user && result.user.role === 'admin') {
          window.location.href = '../../admin-dashboard.html';
        } else {
          window.location.href = '../../dashboard-user.html';
        }
      } catch (err) {
        console.error('Error Login:', err);
        alert(err.message || 'Gagal login');
      }
    });
  }

  // --- REGISTER ---
  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;
      if (password !== confirmPassword) { alert('Konfirmasi password tidak cocok!'); return; }

      const dataRegister = {
        name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        password
      };

      try {
        const res = await fetch(`${API_BASE_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dataRegister) });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Gagal mendaftarkan akun.');
        alert('User berhasil didaftarkan! Silakan login.');
        window.location.href = 'login.html';
      } catch (err) {
        console.error('Error Register:', err);
        alert(err.message || 'Gagal mendaftar');
      }
    });
  }

  // --- FORGOT (SIMULASI) ---
  if (forgotForm) {
    forgotForm.addEventListener('submit', (e) => { e.preventDefault(); alert('Tautan reset password telah dikirim ke email Anda.'); window.location.href = 'login.html'; });
  }

});
