document.addEventListener('DOMContentLoaded', () => {

 const venuesData = [
    {
      id: "V002",
      name: "Lapangan Futsal",
      type: "Futsal",
      facilities: ["Parkir", "Kantin"],
      times: ["Pagi", "Siang", "Sore"],
      price: 100000,
      priceLabel: "Rp 100.000/jam",
      rating: 4.5,
      reviews: 89,
      image: "assets/images/futsal-sintetis.png",
      badge: "PROMO"
    },
    {
      id: "V003",
      name: "Meja Biliard",
      type: "Biliard",
      facilities: ["Parkir", "AC", "WiFi"],
      times: ["Siang", "Sore", "Malam"],
      price: 50000,
      priceLabel: "Rp 50.000/jam",
      rating: 4.9,
      reviews: 210,
      image: "assets/images/meja1.png",
      badge: "SISA 1 SLOT"
    }
  ];

  const venueGrid = document.getElementById('venueGrid');
  const countHasil = document.getElementById('countHasil');

  // 2. FUNGSI RENDER KARTU LAPANGAN
  const renderVenues = (data) => {
    venueGrid.innerHTML = '';
    countHasil.textContent = data.length;

    if(data.length === 0) {
      venueGrid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding: 40px; color:#888;">Maaf, tidak ada lapangan yang sesuai dengan filter Anda.</div>`;
      return;
    }

    data.forEach(venue => {
      // Menentukan warna badge
      let badgeHtml = '';
      if(venue.badge === "TERSEDIA") badgeHtml = `<span class="badge-green">TERSEDIA</span>`;
      else if(venue.badge === "PROMO") badgeHtml = `<span class="badge-green">TERSEDIA</span><span class="badge-dark">PROMO</span>`;
      else if(venue.badge === "SISA 1 SLOT") badgeHtml = `<span class="badge-red">SISA 1 SLOT</span>`;

      // Buat Kartu (Elemen Anchor <a> agar bisa di klik lari ke detail)
      const card = document.createElement('a');
      card.href = `venues-detail.html?id=${venue.id}`; 
      card.className = 'venue-card';
      
      card.innerHTML = `
        <div class="card-img-wrapper">
          <img src="${venue.image}" class="card-img" alt="${venue.name}" onerror="this.src='https://via.placeholder.com/400x250/1a1a1a/555555?text=Image+Placeholder'">
          <div class="card-badges">${badgeHtml}</div>
          <div class="card-rating">⭐ ${venue.rating} <span style="font-weight:400; color:#aaa;">(${venue.reviews})</span></div>
        </div>
        <div class="card-body">
          <h3 class="text-white m-0 mb-4" style="font-size: 18px;">${venue.name}</h3>
          <p class="text-muted m-0 text-small">${venue.type} • ${venue.facilities.join(', ')}</p>
          
          <div class="card-price-row mt-24">
            <div>
              <span class="text-muted text-tiny uppercase d-block mb-4">MULAI DARI</span>
              <span class="text-primary bold" style="font-size: 16px;">${venue.priceLabel}</span>
            </div>
            <div class="btn-arrow">&rarr;</div>
          </div>
        </div>
      `;
      venueGrid.appendChild(card);
      
     // ====================================================
      // LOGIKA SATPAM (HANYA BERJALAN SAAT KARTU DIKLIK)
      // ====================================================
      card.addEventListener('click', (e) => {
        e.preventDefault();
        window.location.href = card.href;
      });
      // ====================================================
    });
  };

  // 3. LOGIKA FILTER DINAMIS
  const filterOlahragaInputs = document.querySelectorAll('.filter-olahraga');
  const filterFasilitasInputs = document.querySelectorAll('.filter-fasilitas');
  const timePills = document.querySelectorAll('.time-pill');
  const inputCariNama = document.getElementById('inputCariNama');
  const sortSelect = document.getElementById('sortLapangan');
  const activeFilterContainer = document.getElementById('activeFilterContainer');

  const applyFilters = () => {
    const selectedOlahraga = Array.from(filterOlahragaInputs).filter(i => i.checked).map(i => i.value);
    const selectedFasilitas = Array.from(filterFasilitasInputs).filter(i => i.checked).map(i => i.value);
    const selectedTimes = Array.from(timePills).filter(btn => btn.classList.contains('active')).map(btn => btn.getAttribute('data-waktu'));
    const searchTerm = inputCariNama.value.toLowerCase();

    let filtered = venuesData.filter(v => {
      const matchOlahraga = selectedOlahraga.length === 0 || selectedOlahraga.includes(v.type);
      const matchFasilitas = selectedFasilitas.length === 0 || selectedFasilitas.every(f => v.facilities.includes(f));
      const matchTime = selectedTimes.length === 0 || selectedTimes.some(t => v.times.includes(t));
      const matchSearch = v.name.toLowerCase().includes(searchTerm);
      
      return matchOlahraga && matchFasilitas && matchTime && matchSearch;
    });

    const sortVal = sortSelect.value;
    if(sortVal === 'termurah') filtered.sort((a,b) => a.price - b.price);
    else if(sortVal === 'termahal') filtered.sort((a,b) => b.price - a.price);
    else if(sortVal === 'rekomendasi') filtered.sort((a,b) => b.rating - a.rating);

    updateActiveChips(selectedOlahraga, selectedTimes);
    renderVenues(filtered);
  };

  const updateActiveChips = (olahraga, waktu) => {
    activeFilterContainer.innerHTML = '<span class="text-muted text-tiny uppercase tracking-wide mr-8">ACTIVE:</span>';
    
    [...olahraga, ...waktu].forEach(filterName => {
      const chip = document.createElement('span');
      chip.className = 'filter-chip';
      chip.innerHTML = `${filterName} <span>&times;</span>`;
      activeFilterContainer.appendChild(chip);
    });

    if(olahraga.length > 0 || waktu.length > 0) {
      const clearBtn = document.createElement('a');
      clearBtn.href = "#"; clearBtn.className = "text-muted text-small ml-8 text-decoration-none";
      clearBtn.style.textDecoration = "underline"; clearBtn.textContent = "Clear All";
      clearBtn.onclick = (e) => { e.preventDefault(); resetAllFilters(); }
      activeFilterContainer.appendChild(clearBtn);
    }
  };

  // 4. PASANG EVENT LISTENER KE SEMUA INPUT
  filterOlahragaInputs.forEach(i => i.addEventListener('change', applyFilters));
  filterFasilitasInputs.forEach(i => i.addEventListener('change', applyFilters));
  inputCariNama.addEventListener('input', applyFilters);
  sortSelect.addEventListener('change', applyFilters);

  timePills.forEach(pill => {
    pill.addEventListener('click', function() {
      this.classList.toggle('active');
      applyFilters();
    });
  });

  const resetAllFilters = () => {
    filterOlahragaInputs.forEach(i => i.checked = false);
    filterFasilitasInputs.forEach(i => i.checked = false);
    timePills.forEach(p => p.classList.remove('active'));
    inputCariNama.value = '';
    sortSelect.value = 'rekomendasi';
    applyFilters();
  };
  
  // Pastikan elemen btnResetFilter ada sebelum menambahkan event listener
  const btnReset = document.getElementById('btnResetFilter');
  if(btnReset) {
      btnReset.addEventListener('click', resetAllFilters);
  }

  // Render Pertama Kali
  applyFilters();

});