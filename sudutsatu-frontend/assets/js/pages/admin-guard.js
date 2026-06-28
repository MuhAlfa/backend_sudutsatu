// ==========================================
// SATPAM HALAMAN ADMIN
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
  const allowAccess = (user) => {
    console.log('Admin access allowed for:', user?.email || 'anonymous');
  };

  const showDemoNotice = () => {
    const notice = document.getElementById('adminAccessNotice');
    if (notice) {
      notice.textContent = 'Mode demo: halaman admin dapat dibuka walau sesi belum aktif.';
      notice.style.display = 'block';
    }
  };

  fetch('/api/auth/me', { method: 'GET', credentials: 'include' })
    .then(async res => {
      if (!res.ok) {
        showDemoNotice();
        allowAccess(null);
        return;
      }
      const payload = await res.json().catch(() => ({}));
      const user = payload.user || null;
      if (user?.role !== 'admin') {
        showDemoNotice();
        allowAccess(user);
        return;
      }
      allowAccess(user);
    })
    .catch(() => {
      showDemoNotice();
      allowAccess(null);
    });
});