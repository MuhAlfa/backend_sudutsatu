document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // KONFIGURASI UMUM SWEETALERT (ANTI-GESER)
  // ==========================================
  const swalConfig = {
    background: '#141414',
    color: '#ffffff',
    confirmButtonColor: '#ccff00',
    cancelButtonColor: '#333',
    backdrop: `rgba(0,0,0,0.8)`,
    heightAuto: false
  };

  // ==========================================
  // 1. DATA VENUE - ambil dari server, fallback ke localStorage
  // ==========================================
  const STORAGE_KEY = 'sudutsatu_venues';
  const API_BASE = 'http://localhost:5000/api';
  // Cookie-based auth: use credentials: 'include' on fetch calls

  let venueData = [];

  const persistVenueData = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(venueData));
  };

  const loadVenuesFromServer = async () => {
    try {
      const res = await fetch(`${API_BASE}/venues`, { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('Gagal memuat venues dari server');
      const result = await res.json();
      venueData = result.data || [];
      renderVenues(venueData);
    } catch (err) {
      console.warn('loadVenuesFromServer failed, falling back to localStorage', err);
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          venueData = JSON.parse(stored);
        } catch (e) {
          console.warn('Invalid venue data in localStorage, resetting to default.', e);
          venueData = [];
        }
      } else {
        // fallback hard-coded minimal data
        venueData = [
          { id: 2, name: "Lapangan Futsal Sintetis", status: "AKTIF", image: "assets/images/futsal-sintetis.png", location: "Sumedang Selatan, Sumedang", sports: ["Futsal"], price: "Rp 100.000", fields: "Indoor (Sintetis)", utility: 78, nextAvailable: null },
          { id: 3, name: "Biliard Meja 1", status: "AKTIF", image: "assets/images/meja1.png", location: "Sumedang Selatan, Sumedang", sports: ["Biliard"], price: "Rp 50.000", fields: "Indoor", utility: 85, nextAvailable: null }
        ];
        persistVenueData();
      }
      renderVenues(venueData);
    }
  };

  let currentEditId = null; 
  let currentTargetId = null; 
  let currentUploadedImage = null; 

  // ==========================================
  // 2. ELEMENTS UTAMA
  // ==========================================
  const venueGridContainer = document.getElementById('venueGridContainer');
  const searchInput = document.getElementById('searchVenue');
  const filterSport = document.getElementById('filterSport');
  const filterStatus = document.getElementById('filterStatus');
  
  const btnTambahLapangan = document.getElementById('btnTambahLapangan');
  const modalVenueForm = document.getElementById('modalVenueForm');
  const closeVenueForm = document.getElementById('closeVenueForm');
  const btnSimpanVenue = document.getElementById('btnSimpanVenue');
  const formModalTitle = document.getElementById('formModalTitle');
  
  const modalSchedule = document.getElementById('modalSchedule');
  const closeSchedule = document.getElementById('closeSchedule');
  const schVenueName = document.getElementById('schVenueName');
  const btnSetAktif = document.getElementById('btnSetAktif');
  const btnSetMaint = document.getElementById('btnSetMaint');

  const modalAnalitik = document.getElementById('modalAnalitik');
  const closeAnalitik = document.getElementById('closeAnalitik');
  const btnTutupAnalitik = document.getElementById('btnTutupAnalitik');
  const anaVenueName = document.getElementById('anaVenueName');

  const inpFoto = document.getElementById('inpFoto');
  const previewFoto = document.getElementById('previewFoto');

  // ==========================================
  // FITUR BACA GAMBAR (FILE READER BASE64)
  // ==========================================
  if (inpFoto) {
    inpFoto.addEventListener('change', function(e) {
      if(e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(event) {
          currentUploadedImage = event.target.result; 
          previewFoto.src = currentUploadedImage; 
          previewFoto.style.display = 'block';
        };
        
        reader.readAsDataURL(file);
      }
    });
  }

  // ==========================================
  // 3. FUNGSI RENDER KARTU (CARD)
  // ==========================================
  const renderVenues = (dataToRender) => {
    venueGridContainer.innerHTML = '';

    if(dataToRender.length === 0) {
      venueGridContainer.innerHTML = `<p class="text-muted" style="grid-column: 1 / -1; text-align: center; padding: 40px;">Tidak ada lapangan yang cocok.</p>`;
      return;
    }

    dataToRender.forEach(venue => {
      let badgeHtml = venue.status === 'AKTIF' 
        ? `<div class="vc-status-badge"><span class="dot-green"></span> AKTIF</div>`
        : `<div class="vc-status-badge"><span class="dot-yellow"></span> PEMELIHARAAN</div>`;

      let imageHtml = venue.image 
        ? `<img src="${venue.image}" alt="${venue.name}" style="width: 100%; height: 100%; object-fit: cover;">`
        : `<div style="width:100%; height:100%; background:#222; display:flex; align-items:center; justify-content:center;"><span style="color:#555;">No Image</span></div>`;

      const sportsHtml = venue.sports.map(s => `<span class="sport-pill">${s}</span>`).join('');

      let customMetricHtml = venue.utility !== null 
        ? `<div><label class="vc-label d-flex justify-between">RATA-RATA UTILITAS <span class="text-primary">${venue.utility}%</span></label><div class="vc-progress-bg"><div class="vc-progress-fill" style="width: ${venue.utility}%;"></div></div></div>`
        : `<div><label class="vc-label">NEXT AVAILABLE</label><p class="vc-value-text d-flex align-center gap-8" style="color: #ffcc00; font-size: 13px;"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg> ${venue.nextAvailable}</p></div>`;

      const card = document.createElement('div');
      card.className = 'venue-card';
      card.innerHTML = `
        <div class="vc-image-container">${badgeHtml}${imageHtml}</div>
        <div class="vc-content">
          <h3 class="vc-title">${venue.name}</h3>
          <div class="vc-location"><svg viewBox="0 0 24 24" width="14" height="14" stroke="currentColor" stroke-width="2" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg> ${venue.location}</div>
          <div class="vc-details-grid">
            <div><label class="vc-label">OLAHRAGA TERSEDIA</label><div class="sport-pill-container">${sportsHtml}</div></div>
            <div><label class="vc-label">HARGA DASAR</label><p class="vc-value-text">${venue.price} <span class="text-muted text-small font-weight-normal">/ hr</span></p></div>
            <div><label class="vc-label">LAPANGAN</label><p class="vc-value-text">${venue.fields}</p></div>
            ${customMetricHtml}
          </div>
          <div class="vc-actions-grid">
            <button class="vc-btn-action btn-action-edit" data-id="${venue.id}">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg> Ubah Detail
            </button>
            <button class="vc-btn-action btn-action-sch" data-id="${venue.id}">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none">${venue.status === 'AKTIF' ? '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line>' : '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>'}</svg> ${venue.status === 'AKTIF' ? 'Jadwal' : 'Manage Maint.'}
            </button>
            <button class="vc-btn-action btn-action-ana" data-id="${venue.id}">
              <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><polyline points="18 20 18 10"></polyline><polyline points="12 20 12 4"></polyline><polyline points="6 20 6 14"></polyline></svg> Analitik
            </button>
          </div>
        </div>
      `;
      venueGridContainer.appendChild(card);
    });

    attachCardEventListeners();
  };

  // ==========================================
  // 4. LOGIKA FILTER PENCARIAN
  // ==========================================
  const applyFilters = () => {
    const term = searchInput.value.toLowerCase();
    const sport = filterSport.value;
    const status = filterStatus.value;
    const filtered = venueData.filter(v => {
      const matchSearch = v.name.toLowerCase().includes(term) || v.location.toLowerCase().includes(term);
      const matchSport = sport === 'All Sports' || v.sports.includes(sport);
      const matchStatus = status === 'All Statuses' || v.status === status;
      return matchSearch && matchSport && matchStatus;
    });
    renderVenues(filtered);
  };

  searchInput.addEventListener('input', applyFilters);
  filterSport.addEventListener('change', applyFilters);
  filterStatus.addEventListener('change', applyFilters);

  // ==========================================
  // 5. LOGIKA MODAL TAMBAH & EDIT LAPANGAN
  // ==========================================
  const clearForm = () => {
    document.getElementById('inpNama').value = '';
    document.getElementById('inpLokasi').value = 'Sumedang';
    document.getElementById('inpHarga').value = '';
    document.getElementById('inpDetail').value = '';
    document.getElementById('inpStatus').value = 'AKTIF';
    document.getElementById('inpOlahraga').value = '';
    
    currentUploadedImage = null;
    if(inpFoto) inpFoto.value = '';
    if(previewFoto) previewFoto.style.display = 'none';

    currentEditId = null;
    formModalTitle.textContent = "Tambah Lapangan Baru";
  };

  btnTambahLapangan.addEventListener('click', () => {
    clearForm();
    modalVenueForm.classList.remove('hidden');
  });

  closeVenueForm.addEventListener('click', () => modalVenueForm.classList.add('hidden'));

  btnSimpanVenue.addEventListener('click', () => {
    const nama = document.getElementById('inpNama').value;
    const lokasi = document.getElementById('inpLokasi').value;
    const harga = document.getElementById('inpHarga').value;
    const detail = document.getElementById('inpDetail').value;
    const status = document.getElementById('inpStatus').value;
    const olahragaTxt = document.getElementById('inpOlahraga').value;
    
    if(!nama || !lokasi) { 
      Swal.fire({
        ...swalConfig,
        icon: 'error',
        title: 'Form Tidak Lengkap!',
        text: 'Nama dan Lokasi wajib diisi.',
        confirmButtonText: '<span style="color: #000; font-weight: bold;">Mengerti</span>'
      });
      return; 
    }

    const arrOlahraga = olahragaTxt ? olahragaTxt.split(',').map(s => s.trim()) : ['Umum'];

    if(currentEditId !== null) {
      const targetObj = venueData.find(v => v.id === currentEditId);
      if(targetObj) {
        const originalName = targetObj.name;
        targetObj.name = nama;
        targetObj.location = lokasi;
        targetObj.price = "Rp " + harga;
        targetObj.fields = detail;
        targetObj.status = status;
        targetObj.sports = arrOlahraga;
        
        if (currentUploadedImage) {
          targetObj.image = currentUploadedImage;
        }

        if (originalName !== nama) {
          // Venue rename: bookings are persisted on the server. Do not update local booking storage.
          console.warn('Venue renamed; booking records should be updated on the server instead of localStorage.');
        }
      }
      persistVenueData();
      
      Swal.fire({
        ...swalConfig,
        icon: 'success',
        title: 'Diperbarui!',
        text: 'Data lapangan berhasil diperbarui.',
        confirmButtonText: '<span style="color: #000; font-weight: bold;">Tutup</span>',
        timer: 2000
      });

    } else {
      const finalImage = currentUploadedImage ? currentUploadedImage : "assets/images/futsal-sintetis.png";

      const newVenue = {
        id: Date.now(),
        name: nama,
        status: status,
        image: finalImage, 
        location: lokasi,
        sports: arrOlahraga,
        price: "Rp " + harga,
        fields: detail,
        utility: 0,
        nextAvailable: "Hari Ini"
      };
      venueData.unshift(newVenue); 
      persistVenueData();
      
      Swal.fire({
        ...swalConfig,
        icon: 'success',
        title: 'Berhasil!',
        text: 'Lapangan baru beserta fotonya berhasil ditambahkan.',
        confirmButtonText: '<span style="color: #000; font-weight: bold;">Mantap</span>',
        timer: 2000
      });
    }

    modalVenueForm.classList.add('hidden');
    applyFilters(); 
  });

  // ==========================================
  // 6. EVENT DELEGATION UNTUK TOMBOL DI DALAM KARTU
  // ==========================================
  const attachCardEventListeners = () => {
    
    document.querySelectorAll('.btn-action-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        const targetVenue = venueData.find(v => v.id === id);
        if(targetVenue) {
          currentEditId = id;
          formModalTitle.textContent = "Ubah Detail Lapangan";
          document.getElementById('inpNama').value = targetVenue.name;
          document.getElementById('inpLokasi').value = targetVenue.location;
          document.getElementById('inpHarga').value = targetVenue.price.replace('Rp ', '');
          document.getElementById('inpDetail').value = targetVenue.fields;
          document.getElementById('inpStatus').value = targetVenue.status;
          document.getElementById('inpOlahraga').value = targetVenue.sports.join(', ');
          
          currentUploadedImage = null;
          if(inpFoto) inpFoto.value = '';

          if (previewFoto && targetVenue.image) {
            previewFoto.src = targetVenue.image;
            previewFoto.style.display = 'block';
          } else if (previewFoto) {
            previewFoto.style.display = 'none';
          }
          
          modalVenueForm.classList.remove('hidden');
        }
      });
    });

    document.querySelectorAll('.btn-action-sch').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        const targetVenue = venueData.find(v => v.id === id);
        if(targetVenue) {
          currentTargetId = id;
          schVenueName.textContent = targetVenue.name;
          modalSchedule.classList.remove('hidden');
        }
      });
    });

    document.querySelectorAll('.btn-action-ana').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.currentTarget.getAttribute('data-id'));
        const targetVenue = venueData.find(v => v.id === id);
        if(targetVenue) {
          anaVenueName.textContent = targetVenue.name;
          modalAnalitik.classList.remove('hidden');
        }
      });
    });
  };

  // ==========================================
  // 7. LOGIKA AKSI JADWAL & ANALITIK
  // ==========================================
  closeSchedule.addEventListener('click', () => modalSchedule.classList.add('hidden'));
  closeAnalitik.addEventListener('click', () => modalAnalitik.classList.add('hidden'));
  btnTutupAnalitik.addEventListener('click', () => modalAnalitik.classList.add('hidden'));

  btnSetAktif.addEventListener('click', () => {
    const targetObj = venueData.find(v => v.id === currentTargetId);
    if (!targetObj) return;
    
    Swal.fire({
      ...swalConfig,
      icon: 'question',
      title: 'Ubah ke Aktif?',
      text: `Anda yakin ingin mengaktifkan kembali ${targetObj.name}?`,
      showCancelButton: true,
      confirmButtonText: '<span style="color: #000; font-weight: bold;">Ya, Aktifkan</span>',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if(result.isConfirmed) {
        targetObj.status = 'AKTIF';
        persistVenueData();
        modalSchedule.classList.add('hidden');
        applyFilters();
        
        Swal.fire({
          ...swalConfig,
          icon: 'success',
          title: 'Berhasil',
          text: `${targetObj.name} telah berstatus AKTIF.`,
          confirmButtonText: '<span style="color: #000; font-weight: bold;">Tutup</span>',
          timer: 2000
        });
      }
    });
  });

  btnSetMaint.addEventListener('click', () => {
    const targetObj = venueData.find(v => v.id === currentTargetId);
    if (!targetObj) return;
    
    Swal.fire({
      ...swalConfig,
      icon: 'warning',
      title: 'Pemeliharaan?',
      text: `Jadwal ${targetObj.name} akan ditutup untuk pengunjung. Yakin?`,
      showCancelButton: true,
      confirmButtonColor: '#ff5555', 
      confirmButtonText: 'Ya, Tutup Lapangan',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if(result.isConfirmed) {
        targetObj.status = 'PEMELIHARAAN';
        persistVenueData();
        modalSchedule.classList.add('hidden');
        applyFilters();
        
        Swal.fire({
          ...swalConfig,
          icon: 'success',
          title: 'Mode Pemeliharaan',
          text: `${targetObj.name} masuk masa PEMELIHARAAN.`,
          confirmButtonText: '<span style="color: #000; font-weight: bold;">Tutup</span>',
          timer: 2000
        });
      }
    });
  });

  // ==========================================
  // INITIAL RENDER: muat dari server (fallback ke localStorage)
  // ==========================================
  loadVenuesFromServer();
});