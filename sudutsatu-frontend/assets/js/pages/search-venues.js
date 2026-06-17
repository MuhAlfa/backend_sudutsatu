// ==================================================
// PAGE: SEARCH-VENUES.JS
// ==================================================

// Kita menggunakan event DOMContentLoaded agar script
// berjalan setelah HTML selesai dimuat.
document.addEventListener('DOMContentLoaded', () => {
  // Identifikasi elemen UI penting (UI Layer)
  const venueGrid = document.getElementById('venueGrid');
  const resultsCount = document.getElementById('resultsCount');
  
  // Ambil input filter
  const filterSport = document.getElementById('filterSport');
  const filterLocation = document.getElementById('filterLocation');
  const filterDate = document.getElementById('filterDate');
  const btnApplyFilter = document.getElementById('btnApplyFilter');

  // --- REUSABLE FUNCTIONS ---

  // Fungsi untuk memformat mata uang (misal: 150000 menjadi Rp 150.000)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount).replace(',00', '');
  };

  // --- DATA RENDERING ---

  // Fungsi untuk merender daftar lapangan ke grid HTML
  const renderVenues = (venuesArray) => {
    // Kosongkan grid terlebih dahulu
    venueGrid.innerHTML = '';

    // Perbarui jumlah hasil (Empty State Check)
    const count = venuesArray.length;
    resultsCount.textContent = `Menampilkan ${count} lapangan terbaik`;

    // 1. EMPTY STATE: Tidak ada lapangan yang cocok
    if (count === 0) {
      venueGrid.innerHTML = `
        <div class="state-container empty-state">
          <div class="state-icon">&#128269;</div>
          <h3>Lapangan Tidak Ditemukan</h3>
          <p>Coba sesuaikan filter pencarian Anda.</p>
        </div>
      `;
      return;
    }

    // 2. LOADING STATE: (Akan diimplementasikan saat integrasi API)
    // Untuk saat ini, kita langsung render data.

    // 3. DATA STATE: Render setiap lapangan (Reuse Card Component)
    venuesArray.forEach(venue => {
      const cardHtml = `
        <a href="venue-detail.html?id=${venue.id}" class="venue-card">
          <div class="card-image-wrapper">
            <img src="${venue.imageUrl}" alt="${venue.name}" class="venue-card-image">
            <span class="card-type-badge box-dark">${venue.type}</span>
          </div>
          <div class="venue-card-body">
            <h3 class="venue-card-name">${venue.name}</h3>
            <p class="venue-card-location">
              &#128205; ${venue.location}
            </p>
            <div class="venue-card-details">
              <div class="venue-card-rating">
                &#11088; ${venue.rating}
              </div>
              <div class="venue-card-price">
                ${formatCurrency(venue.pricePerHour)} <span class="price-unit">/ jam</span>
              </div>
            </div>
          </div>
        </a>
      `;
      venueGrid.insertAdjacentHTML('beforeend', cardHtml);
    });
  };

  // --- EVENT HANDLERS ---

  // Fungsi untuk menangani aksi filter (Simulasi Client-side Filtering)
  const handleFilter = () => {
    // Ambil nilai filter saat ini
    const sportType = filterSport.value;
    const locationValue = filterLocation.value.toLowerCase();
    
    // Nanti untuk date, logikanya akan lebih kompleks (cek jadwal mysql)
    // const dateValue = filterDate.value;

    // Filter data dummy yang kita miliki (js/data/venues.js)
    // venuesData diasumsikan sudah dimuat di HTML global sebelum script ini.
    const filteredData = venuesData.filter(venue => {
      // Cek kesocokan tipe olahraga
      const matchSport = sportType === 'All' || venue.type === sportType;
      
      // Cek kesocokan lokasi
      const matchLocation = locationValue === '' || venue.location.toLowerCase().includes(locationValue);

      return matchSport && matchLocation;
    });

    // Render ulang UI dengan data yang sudah difilter
    renderVenues(filteredData);
  };

  // Pasang event listener pada tombol "Terapkan Filter"
  if (btnApplyFilter) {
    btnApplyFilter.addEventListener('click', handleFilter);
  }

  // --- INITIALIZATION ---
  // Render seluruh lapangan saat pertama kali halaman dimuat
  // venuesData diasumsikan sudah dimuat di HTML global sebelum script ini.
  renderVenues(venuesData); 

});