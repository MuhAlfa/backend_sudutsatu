/* ==========================================================================
   GLOBAL SCRIPT - SUDUTSATU
   File ini menangani semua elemen global (Top Bar, Notifikasi, Sidebar, Logout)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. LOGIKA PANEL NOTIFIKASI LONCENG
  // ==========================================
  const btnNotif = document.getElementById('btnNotifLonceng');
  const panelNotif = document.getElementById('panelNotifikasi');

  if (btnNotif && panelNotif) {
    panelNotif.style.transition = 'all 0.2s ease';

    btnNotif.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation(); 
      panelNotif.classList.toggle('show');
    });

    document.addEventListener('click', function(e) {
      if (!panelNotif.contains(e.target) && !btnNotif.contains(e.target)) {
        panelNotif.classList.remove('show');
      }
    });

    panelNotif.addEventListener('click', function(e) {
      e.stopPropagation();
    });
  }

  // ==========================================
  // 2. SINKRONISASI FOTO PROFIL GLOBAL
  // ==========================================
  const savedProfilePic = localStorage.getItem('adminProfilePic');
  const API_BASE = 'http://localhost:5000/api';
  
  if (savedProfilePic) {
    const topbarProfileImgs = document.querySelectorAll('.topbar-profile img');
    topbarProfileImgs.forEach(img => {
      img.src = savedProfilePic; 
    });

    const settingsProfileImg = document.getElementById('profileImagePreview');
    if (settingsProfileImg) {
      settingsProfileImg.src = savedProfilePic;
    }
  }

  // ==========================================
  // 3. DATABASE PESAN MASUK & NOTIFIKASI BADGE
  // ==========================================
  const defaultMessages = [
    { id: 1, name: "Reza Pratama", category: "Keluhan", email: "reza@gmail.com", phone: "628512345678", content: "Lampu di Biliard Meja 3 agak redup...", date: "19 Juni 2026", status: "unread" },
    { id: 2, name: "Soni Wijaya", category: "Pertanyaan", email: "soni@unpad.ac.id", phone: "628198765432", content: "Apakah untuk pemesanan Lapangan Futsal A...", date: "18 Juni 2026", status: "unread" },
    { id: 3, name: "Indah Permata", category: "Kerjasama", email: "indah@majujaya.com", phone: "628211223344", content: "Kami dari tim marketing Maju Jaya...", date: "15 Juni 2026", status: "read" },
    { id: 4, name: "Arif Hidayat", category: "Keluhan", email: "arifhid@yahoo.com", phone: "628776655443", content: "Sistem pembayaran via QRIS tadi sore sempat delay...", date: "12 Juni 2026", status: "read" }
  ];

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/contact`, { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('no-server');
      // If server returns, do not seed demo messages
    } catch (err) {
      if (!localStorage.getItem('adminMessagesData')) {
        localStorage.setItem('adminMessagesData', JSON.stringify(defaultMessages));
      }
    }
  })();

  window.updateGlobalMessageBadge = function() {
    const storedMessages = localStorage.getItem('adminMessagesData');
    const msgs = storedMessages ? JSON.parse(storedMessages) : [];
    const unreadCount = Array.isArray(msgs) ? msgs.filter(m => m && m.status === 'unread').length : 0;

    const badgeSide = document.getElementById('badgePesanSide');
    if (badgeSide) {
      badgeSide.textContent = unreadCount;
      badgeSide.style.display = unreadCount > 0 ? 'flex' : 'none';
    }

    const badgeTab = document.getElementById('badgePesanTab');
    if (badgeTab) {
      badgeTab.textContent = unreadCount;
      badgeTab.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }
  };

  window.updateGlobalMessageBadge();

  // ==========================================
  // 4. DATABASE VERIFIKASI PEMBAYARAN & NOTIFIKASI
  // ==========================================
  const defaultVerifications = [
    { id: "#BK-SMD-8821", tim: "Tampomas FC", avatar: "TF", avatarBg: "#2a3547", avatarColor: "#8cb0ff", lapangan: "Lapangan Vinyl", waktu: "19:00 - 21:00", nominal: "Rp 150.000", buktiSrc: "assets/images/struk1.jpg" },
    { id: "#BK-SMD-8822", tim: "Jatinangor United", avatar: "JU", avatarBg: "#1e2846", avatarColor: "#7da5ff", lapangan: "Lapangan Vinyl", waktu: "20:00 - 22:00", nominal: "Rp 225.000", buktiSrc: "assets/images/struk2.jpg" },
    { id: "#BK-SMD-8825", tim: "Cimalaka Boys", avatar: "CB", avatarBg: "#23314d", avatarColor: "#8baeff", lapangan: "Lapangan Sintetis", waktu: "15:00 - 17:00", nominal: "Rp 100.000", buktiSrc: "assets/images/struk3.jpg" }
  ];

  (async () => {
    try {
      const res = await fetch(`${API_BASE}/booking`, { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('no-server');
      // server available, do not seed demo verifications
    } catch (err) {
      if (!localStorage.getItem('adminVerificationData')) {
        localStorage.setItem('adminVerificationData', JSON.stringify(defaultVerifications));
      }
    }
  })();

  window.updateGlobalVerificationBadge = function() {
    const storedVerifications = localStorage.getItem('adminVerificationData');
    const verifs = storedVerifications ? JSON.parse(storedVerifications) : [];
    const verifCount = Array.isArray(verifs) ? verifs.length : 0;
    
    const badgeVerifSide = document.getElementById('badgeVerifikasiSide');
    if (badgeVerifSide) {
      badgeVerifSide.textContent = verifCount;
      badgeVerifSide.style.display = verifCount > 0 ? 'flex' : 'none';
    }
  };

  window.updateGlobalVerificationBadge();

  // ==========================================
  // 5. LOGIKA KELUAR AKUN (LOG OUT GLOBAL)
  // ==========================================
  // Menggabungkan semua ID tombol logout yang tersebar di halaman Admin dan User
  const btnLogouts = document.querySelectorAll('#btnLogout, #btnLogoutSidebar, #btnLogoutProfile, .logout-menu');

  btnLogouts.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); 
      
      // SATU-SATUNYA SWEETALERT UNTUK LOGOUT DI APLIKASI
      Swal.fire({
        icon: 'question',
        title: 'Yakin ingin keluar?',
        text: "Anda harus login kembali untuk mengakses fitur.",
        background: '#141414',
        color: '#ffffff',
        confirmButtonColor: '#ff5555', // Warna merah untuk menandakan aksi keluar
        cancelButtonColor: '#333',
        showCancelButton: true,
        confirmButtonText: '<span style="color: #ffffff; font-weight: bold;">Ya, Keluar!</span>',
        cancelButtonText: 'Batal',
        backdrop: `rgba(0,0,0,0.8)`,
        heightAuto: false,
        scrollbarPadding: false
      }).then((result) => {
        
        if (result.isConfirmed) {
          // Panggil server untuk menghapus cookie sesi
          fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' })
            .catch(() => null)
            .then(() => {
              // Hapus data sisi-klien jika ada
              localStorage.removeItem('token');
              localStorage.removeItem('userProfile'); 
              localStorage.removeItem('userSession'); 

              Swal.fire({
                icon: 'success',
                title: 'Berhasil!',
                text: 'Anda telah keluar dari akun.',
                background: '#141414',
                color: '#ffffff',
                confirmButtonColor: '#ccff00',
                confirmButtonText: '<span style="color: #000; font-weight: bold;">Tutup</span>',
                timer: 2000,
                backdrop: `rgba(0,0,0,0.8)`,
                heightAuto: false,
                scrollbarPadding: false
              }).then(() => {
                const currentPath = window.location.pathname;
                const baseFolderIndex = currentPath.indexOf('/sudutsatu-frontend/');
                let redirectPath = '/index.html';

                if (baseFolderIndex !== -1) {
                  const remaining = currentPath.slice(baseFolderIndex + '/sudutsatu-frontend/'.length);
                  const depth = remaining.split('/').length - 1;
                  const prefix = depth > 0 ? '../'.repeat(depth) : '';
                  redirectPath = `${prefix}index.html`;
                }

                window.location.href = redirectPath;
              });
            });
        }
      });

    });
  });

});