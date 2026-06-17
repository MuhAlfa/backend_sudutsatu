document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. DATA DUMMY 
  // ==========================================
  let venueData = [
    {
      id: 1,
      name: "Lapangan Sintetis",
      status: "AKTIF",
      image: "assets/images/futsal-sintetis.png",
      location: "Sumedang Selatan, Sumedang",
      sports: ["Futsal", "Biliard"],
      price: "Rp 150.000",
      fields: "Indoor",
      utility: 78,
      nextAvailable: null
    },
    {
      id: 2,
      name: "Lapangan Vinyl",
      status: "PEMELIHARAAN",
      image: "assets/images/futsal-vinyl.png",
      location: "Sumedang Selatan, Sumedang",
      sports: ["Futsal", "Biliard"],
      price: "Rp 100.000",
      fields: "Indoor (Turf)",
      utility: null,
      nextAvailable: "Tomorrow"
    },
    {
      id: 3,
      name: "Biliard Meja 1",
      status: "AKTIF",
      image: "assets/images/meja1.png",
      location: "Sumedang Selatan, Sumedang",
      sports: ["Futsal", "Biliard"],
      price: "Rp 100.000",
      fields: "Indoor (Turf)",
      utility: 85,
      nextAvailable: null
    },
    {
      id: 4,
      name: "Biliard Meja 2",
      status: "AKTIF",
      image: "assets/images/meja2.png",
      location: "Sumedang Selatan, Sumedang",
      sports: ["Futsal", "Biliard"],
      price: "Rp 100.000",
      fields: "Indoor (Turf)",
      utility: 90,
      nextAvailable: null
    }
  ];

  let currentEditId = null; 
  let currentTargetId = null; 

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
        ? `<img src="${venue.image}" alt="${venue.name}">`
        : `<svg viewBox="0 0 24 24" width="64" height="64" stroke="currentColor" stroke-width="1.5" fill="none" class="vc-icon-placeholder"><circle cx="12" cy="12" r="10"></circle><path d="M12 12l3.5-2m-3.5 2l-3.5-2m3.5 2v4m7.5-6a5 5 0 00-7.5 0m-4 0a5 5 0 00-7.5 0"></path></svg>`;

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
    
    if(!nama || !lokasi) { alert('Nama dan Lokasi wajib diisi!'); return; }

    const arrOlahraga = olahragaTxt ? olahragaTxt.split(',').map(s => s.trim()) : ['Umum'];

    if(currentEditId !== null) {
      // EDIT MODE
      const targetObj = venueData.find(v => v.id === currentEditId);
      if(targetObj) {
        targetObj.name = nama;
        targetObj.location = lokasi;
        targetObj.price = "Rp " + harga;
        targetObj.fields = detail;
        targetObj.status = status;
        targetObj.sports = arrOlahraga;
      }
      alert('Data lapangan berhasil diperbarui!');
    } else {
      // ADD NEW MODE
      let autoAssignedImage = "assets/images/futsal-sintetis.png"; // Gambar Default
      
      const checkText = (nama + " " + olahragaTxt).toLowerCase();
      
      // PERBAIKAN LOGIKA: Cek kata 'futsal' lebih dulu, jangan dipersulit.
      if (checkText.includes('futsal')) {
        if (checkText.includes('vinyl')) {
          autoAssignedImage = "assets/images/futsal-vinyl.png"; 
        } else {
          autoAssignedImage = "assets/images/futsal-sintetis.png"; 
        }
      } 
      // Jika bukan futsal, baru cek apakah itu biliard
      else if (checkText.includes('biliard') || checkText.includes('biliar')) {
        if (checkText.includes('meja 2')) {
          autoAssignedImage = "assets/images/meja2.png";
        } else {
          autoAssignedImage = "assets/images/meja1.png"; 
        }
      }

      const newVenue = {
        id: Date.now(),
        name: nama,
        status: status,
        image: autoAssignedImage, 
        location: lokasi,
        sports: arrOlahraga,
        price: "Rp " + harga,
        fields: detail,
        utility: 0,
        nextAvailable: "Hari Ini"
      };
      venueData.unshift(newVenue); 
      alert('Lapangan baru berhasil ditambahkan!');
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
    if(targetObj) targetObj.status = 'AKTIF';
    modalSchedule.classList.add('hidden');
    applyFilters();
    alert(`${targetObj.name} di-set menjadi AKTIF.`);
  });

  btnSetMaint.addEventListener('click', () => {
    const targetObj = venueData.find(v => v.id === currentTargetId);
    if(targetObj) targetObj.status = 'PEMELIHARAAN';
    modalSchedule.classList.add('hidden');
    applyFilters();
    alert(`${targetObj.name} masuk masa PEMELIHARAAN.`);
  });

  // ==========================================
  // INITIAL RENDER
  // ==========================================
  renderVenues(venueData);

});