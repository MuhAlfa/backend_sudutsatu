document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. LOGIKA PERPINDAHAN TAB (TAB NAVIGATION)
  // ==========================================
  const tabButtons = document.querySelectorAll('.set-tab-btn');
  const tabPanels = document.querySelectorAll('.set-panel');

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Hilangkan status aktif dari semua tombol
      tabButtons.forEach(b => b.classList.remove('active'));
      // Sembunyikan semua panel
      tabPanels.forEach(p => p.classList.remove('active-panel'));

      // Berikan status aktif pada tombol yang diklik
      btn.classList.add('active');
      // Munculkan panel yang sesuai dengan data-target
      const targetId = btn.getAttribute('data-target');
      document.getElementById(targetId).classList.add('active-panel');
    });
  });

  // ==========================================
  // 2. SIMULASI TOMBOL SIMPAN (FORM SUBMISSION)
  // ==========================================
  const saveButtons = document.querySelectorAll('.btn-save');

  saveButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault(); // Mencegah halaman ke-refresh

      const originalText = btn.textContent;
      btn.textContent = "Menyimpan...";
      btn.style.opacity = "0.7";
      btn.style.pointerEvents = "none";

      setTimeout(() => {
        btn.textContent = "Tersimpan ✓";
        btn.style.background = "#222";
        btn.style.color = "var(--color-primary)";
        btn.style.borderColor = "var(--color-primary)";
        
        setTimeout(() => {
          // Kembalikan ke wujud asal
          btn.textContent = originalText;
          btn.style.background = "";
          btn.style.color = "";
          btn.style.borderColor = "";
          btn.style.opacity = "1";
          btn.style.pointerEvents = "auto";
        }, 2000);
      }, 800);
    });
  });

  // ==========================================
  // 3. LOGIKA MANAJEMEN STAF (Tambah/Hapus)
  // ==========================================
  const btnTambahStaf = document.getElementById('btnTambahStaf');
  const modalAddStaff = document.getElementById('modalAddStaff');
  const btnCancelStaff = document.getElementById('btnCancelStaff');
  const btnSaveStaff = document.getElementById('btnSaveStaff');

  // Munculkan Modal
  if (btnTambahStaf) {
    btnTambahStaf.addEventListener('click', () => {
      modalAddStaff.style.display = 'flex';
      modalAddStaff.classList.remove('hidden');
    });
  }

  // Tutup Modal
  if (btnCancelStaff) {
    btnCancelStaff.addEventListener('click', () => {
      modalAddStaff.style.display = 'none';
      document.getElementById('newStaffName').value = ''; // Reset input
    });
  }

  // Simpan Staf Baru (Simulasi nambah ke tabel)
  if (btnSaveStaff) {
    btnSaveStaff.addEventListener('click', () => {
      const staffName = document.getElementById('newStaffName').value || "Staf Baru";
      
      const tbody = document.querySelector('.staff-table tbody');
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-white bold">${staffName}</td>
        <td><span class="role-badge role-staff">Kasir</span></td>
        <td>user@sudutsatu.com</td>
        <td><span class="text-primary">Aktif</span></td>
        <td><button class="btn-text text-red btn-hapus-staf">Hapus</button></td>
      `;
      
      tbody.appendChild(tr);
      modalAddStaff.style.display = 'none';
      document.getElementById('newStaffName').value = '';
      
      alert(`Undangan email telah dikirim ke ${staffName}!`);
      attachHapusListener(); // Pasang event hapus ke tombol baru
    });
  }

  // Fungsi Hapus Staf
  const attachHapusListener = () => {
    document.querySelectorAll('.btn-hapus-staf, .text-red').forEach(btn => {
      // Hapus event lama agar tidak tumpang tindih
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', (e) => {
        if(confirm("Apakah Anda yakin ingin mencabut akses staf ini?")) {
          const row = e.target.closest('tr');
          row.style.opacity = '0';
          setTimeout(() => row.remove(), 300);
        }
      });
    });
  };

  // Jalankan sekali saat load
  attachHapusListener();
// ==========================================
  // 4. FITUR UBAH FOTO PROFIL (LOCAL PREVIEW)
  // ==========================================
  const btnUbahFoto = document.getElementById('btnUbahFoto');
  const uploadFotoProfil = document.getElementById('uploadFotoProfil');
  const profileImagePreview = document.getElementById('profileImagePreview');

  if (btnUbahFoto && uploadFotoProfil && profileImagePreview) {

    // ==========================================
  // 4. FITUR UBAH FOTO PROFIL (LOCAL PREVIEW & SAVE)
  // ==========================================
  const btnUbahFoto = document.getElementById('btnUbahFoto');
  const uploadFotoProfil = document.getElementById('uploadFotoProfil');
  const profileImagePreview = document.getElementById('profileImagePreview');

  if (btnUbahFoto && uploadFotoProfil && profileImagePreview) {
    
    btnUbahFoto.addEventListener('click', () => {
      uploadFotoProfil.click();
    });

    uploadFotoProfil.addEventListener('change', (e) => {
      const file = e.target.files[0];
      
      if (file) {
        // Validasi ukuran maksimal 2MB
        const maxSize = 2 * 1024 * 1024; 
        if (file.size > maxSize) {
          alert("Gagal: Ukuran file foto terlalu besar! Maksimal 2MB.");
          uploadFotoProfil.value = ''; 
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          const imageData = e.target.result; // Data gambar dalam bentuk Base64

          // 1. Ganti gambar utama di halaman Pengaturan ini
          profileImagePreview.src = imageData;
          
          // 2. Ganti foto profil kecil di Top Bar halaman ini
          const topbarProfileImg = document.querySelector('.topbar-profile img');
          if (topbarProfileImg) {
            topbarProfileImg.src = imageData;
          }

          // 3. SIMPAN KE MEMORI BROWSER (LOCALSTORAGE) AGAR TERBAWA KE HALAMAN LAIN!
          localStorage.setItem('adminProfilePic', imageData);
        };
        reader.readAsDataURL(file);
      }
    });
  }
    
    // Ketika tombol "Ubah Foto" diklik, wakilkan klik ke input file yang disembunyikan
    btnUbahFoto.addEventListener('click', () => {
      uploadFotoProfil.click();
    });

    // Ketika admin selesai memilih gambar dari perangkatnya
    uploadFotoProfil.addEventListener('change', (e) => {
      const file = e.target.files[0];
      
      if (file) {
        // Validasi ukuran (contoh: batas 2MB)
        const maxSize = 2 * 1024 * 1024; // 2MB dalam bytes
        if (file.size > maxSize) {
          alert("Gagal: Ukuran file foto terlalu besar! Maksimal 2MB.");
          uploadFotoProfil.value = ''; // Reset file input
          return;
        }

        // Tampilkan gambar langsung ke layar (Preview) tanpa harus upload ke server dulu
        const reader = new FileReader();
        reader.onload = (e) => {
          // Ganti gambar utama di Pengaturan
          profileImagePreview.src = e.target.result;
          
          // Opsional: Ganti juga foto profil mungil yang ada di Top Bar agar selaras!
          const topbarProfileImg = document.querySelector('.topbar-profile img');
          if (topbarProfileImg) {
            topbarProfileImg.src = e.target.result;
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }

});