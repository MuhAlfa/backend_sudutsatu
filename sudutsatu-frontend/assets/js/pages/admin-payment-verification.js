document.addEventListener('DOMContentLoaded', () => {

  const API_BASE = 'http://localhost:5000/api';
  // Cookie-based auth: server sets HttpOnly cookie; use credentials in fetch
  let verificationData = [];

  const tableBody = document.getElementById('tableBody');
  const modalKonfirmasi = document.getElementById('modalKonfirmasi');
  let activeVerificationId = null;

  // KONFIGURASI UMUM SWEETALERT MINIMALIS
  const swalConfig = {
    background: '#141414',
    color: '#ffffff',
    confirmButtonColor: '#ccff00',
    cancelButtonColor: '#333',
    backdrop: `rgba(0,0,0,0.8)`,
    heightAuto: false
  };

  // Fungsi penyimpanan lokal tidak lagi digunakan (server sebagai SOT)
  const saveVerificationData = () => {
    if (window.updateGlobalVerificationBadge) {
      window.updateGlobalVerificationBadge();
    }
  };

  const loadVerificationFromServer = async () => {
    try {
      const res = await fetch(`${API_BASE}/booking`, { method: 'GET', credentials: 'include' });

      if (!res.ok) throw new Error('Gagal memuat data booking dari server');

      const result = await res.json();
      const rows = Array.isArray(result?.data) ? result.data : (Array.isArray(result) ? result : []);

      verificationData = rows
        .filter((b) => String(b.status || '').toLowerCase() === 'pending_verification')
        .map((b) => ({
          id: String(b.id),
          tim: b.team_name || b.teamName || b.user_name || 'Tim Tidak Dikenal',
          lapangan: b.venue_name || b.venue || 'Venue tidak tersedia',
          waktu: `${b.booking_date || ''} ${b.start_time || ''}${b.end_time ? ` - ${b.end_time}` : ''}`.trim(),
          nominal: `Rp ${Number(b.total_price || 0).toLocaleString('id-ID')}`,
          buktiSrc: b.payment_proof || 'https://via.placeholder.com/60x40/141414/ccff00?text=No+Proof',
          avatarBg: '#222',
          avatarColor: '#ccff00',
          avatar: (b.team_name || b.teamName || 'T').charAt(0).toUpperCase(),
          raw: b
        }));

      renderTable();
    } catch (err) {
      console.error('loadVerificationFromServer', err);
      const fallback = JSON.parse(localStorage.getItem('adminVerificationData')) || [];
      verificationData = fallback;
      renderTable();
    }
  };

  // ==========================================
  // RENDER TABEL
  // ==========================================
  const renderTable = () => {
    if(!tableBody) return;
    tableBody.innerHTML = '';

    const headerAngka = document.getElementById('headerStatusAngka');
    const tableFooter = document.getElementById('tableFooterVerifikasi');
    const textFooter = document.getElementById('textFooterVerifikasi');

    // JIKA SEMUA DATA SUDAH DIVERIFIKASI
    if (verificationData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color:#555;">Hore! Tidak ada pembayaran tertunda saat ini.</td></tr>`;
      
      // Sembunyikan dan reset teks yang bocor
      if (headerAngka) headerAngka.textContent = "0";
      if (tableFooter) tableFooter.style.display = 'none';
      return;
    }

    // JIKA DATA MASIH ADA
    if (headerAngka) headerAngka.textContent = verificationData.length;
    
    if (tableFooter) tableFooter.style.display = 'flex';
    if (textFooter) {
      textFooter.innerHTML = `Menampilkan <strong class="text-white">1</strong> hingga <strong class="text-white">${verificationData.length}</strong> dari <strong class="text-white">${verificationData.length}</strong> verifikasi tertunda`;
    }

    verificationData.forEach(item => {
      const tr = document.createElement('tr');
      tr.className = 'table-row';
      tr.innerHTML = `
        <td><span class="id-pill text-white">${item.id}</span></td>
        <td>
          <div class="d-flex align-center gap-12">
            <div class="team-avatar" style="background: ${item.avatarBg}; color: ${item.avatarColor};">${item.avatar}</div>
            <span class="text-white bold team-name-cell">${item.tim}</span>
          </div>
        </td>
        <td class="text-muted">${item.lapangan}</td>
        <td class="text-primary bold">${item.waktu}</td>
        <td class="text-white">${item.nominal}</td>
        <td>
          <img src="${item.buktiSrc}" class="bukti-thumb" alt="Bukti ${item.id}" data-id="${item.id}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px; cursor: pointer; border: 1px solid #444; transition: 0.2s;">
        </td>
      `;
      tableBody.appendChild(tr);
    });

    attachImageClickListeners();
  };

  // ==========================================
  // LOGIKA KLIK GAMBAR (MEMBUKA MODAL)
  // ==========================================
  const attachImageClickListeners = () => {
    const images = document.querySelectorAll('.bukti-thumb');
    
    images.forEach(img => {
      img.addEventListener('mouseenter', () => img.style.transform = 'scale(1.1)');
      img.addEventListener('mouseleave', () => img.style.transform = 'scale(1)');

      img.addEventListener('click', (e) => {
        const idToOpen = e.target.getAttribute('data-id');
        const data = verificationData.find(v => v.id === idToOpen);
        
        if (data && modalKonfirmasi) {
          activeVerificationId = data.id;
          
          document.getElementById('konfImg').src = data.buktiSrc;
          document.getElementById('konfId').textContent = data.id;
          document.getElementById('konfNominal').textContent = data.nominal;
          document.getElementById('konfTim').textContent = data.tim;
          document.getElementById('konfWaktu').textContent = data.waktu;

          modalKonfirmasi.classList.remove('hidden');
          modalKonfirmasi.style.display = 'flex';
        }
      });
    });
  };

  // ==========================================
  // TUTUP MODAL
  // ==========================================
  const closeKonfirmasiBtn = document.getElementById('closeKonfirmasi');
  if (closeKonfirmasiBtn) {
    closeKonfirmasiBtn.addEventListener('click', () => {
      modalKonfirmasi.style.display = 'none';
      modalKonfirmasi.classList.add('hidden');
      activeVerificationId = null;
    });
  }

  // ==========================================
  // AKSI SETUJUI ATAU TOLAK PEMBAYARAN
  // ==========================================
  const btnSetujui = document.getElementById('btnSetujui');
  const btnTolak = document.getElementById('btnTolak');

  if (btnSetujui) {
    btnSetujui.addEventListener('click', () => {
      if (!activeVerificationId) return;

      Swal.fire({
        ...swalConfig,
        icon: 'question',
        title: 'Verifikasi Valid?',
        text: 'Pastikan nominal di struk sesuai dengan tagihan.',
        showCancelButton: true,
        confirmButtonText: '<span style="color: #000; font-weight: bold;">Ya, Setujui</span>',
        cancelButtonText: 'Batal'
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            const resp = await fetch(`${API_BASE}/booking/${activeVerificationId}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'confirmed' })
            });
            if (!resp.ok) throw new Error('Gagal memverifikasi pembayaran di server');

            verificationData = verificationData.filter(v => v.id !== activeVerificationId);
            saveVerificationData();
          } catch (err) {
            console.error(err);
            Swal.fire({ ...swalConfig, icon: 'error', title: 'Gagal', text: err.message || 'Verifikasi gagal' });
            return;
          }

          Swal.fire({
            ...swalConfig,
            icon: 'success',
            title: 'Pembayaran Diterima!',
            text: `E-Ticket untuk pesanan ${activeVerificationId} telah dikirim.`,
            confirmButtonText: '<span style="color: #000; font-weight: bold;">Tutup</span>',
            timer: 2000
          });

          modalKonfirmasi.style.display = 'none';
          modalKonfirmasi.classList.add('hidden');
          activeVerificationId = null;
          renderTable();
        }
      });
    });
  }

  if (btnTolak) {
    btnTolak.addEventListener('click', () => {
      if (!activeVerificationId) return;

      Swal.fire({
        ...swalConfig,
        icon: 'warning',
        title: 'Tolak Pembayaran',
        input: 'text',
        inputLabel: 'Alasan penolakan (misal: Gambar blur, struk palsu)',
        inputPlaceholder: 'Ketik alasan...',
        showCancelButton: true,
        confirmButtonColor: '#ff5555',
        confirmButtonText: 'Tolak Pembayaran',
        cancelButtonText: 'Batal',
        preConfirm: (alasan) => {
          if (!alasan) {
            Swal.showValidationMessage('Alasan penolakan WAJIB diisi!');
          }
          return alasan;
        }
      }).then(async (result) => {
        if (result.isConfirmed) {
          const alasanFix = result.value;

          try {
            const resp = await fetch(`${API_BASE}/booking/${activeVerificationId}`, {
              method: 'PUT',
              credentials: 'include',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ status: 'cancelled' })
            });
            if (!resp.ok) throw new Error('Gagal menolak pembayaran di server');
            verificationData = verificationData.filter(v => v.id !== activeVerificationId);
            saveVerificationData();
          } catch (err) {
            console.error(err);
            Swal.fire({ ...swalConfig, icon: 'error', title: 'Gagal', text: err.message || 'Proses penolakan gagal' });
            return;
          }

          Swal.fire({
            ...swalConfig,
            icon: 'success',
            title: 'Pembayaran Ditolak',
            text: `Pesanan dibatalkan. Alasan: ${alasanFix}`,
            confirmButtonText: '<span style="color: #000; font-weight: bold;">Tutup</span>',
            timer: 2500
          });

          modalKonfirmasi.style.display = 'none';
          modalKonfirmasi.classList.add('hidden');
          activeVerificationId = null;
          renderTable();
        }
      });
    });
  }

  // Panggil pertama kali
  loadVerificationFromServer();

});