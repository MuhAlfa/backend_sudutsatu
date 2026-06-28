document.addEventListener('DOMContentLoaded', () => {

  const swalConfig = {
    background: '#141414', color: '#ffffff', confirmButtonColor: '#ccff00',
    backdrop: `rgba(0,0,0,0.8)`, heightAuto: false, scrollbarPadding: false
  };

  // ==========================================
  // 1. DATABASE LAPANGAN (Vinyl & Meja 2 Sudah Dihapus!)
  // ==========================================
  const venuesDB = {
    "V002": { name: "Lapangan Sintetis Indoor", img: "assets/images/futsal-sintetis.png", rating: "4.5 (89 Reviews)", loc: "SudutSatu Arena Lantai 1", type: "INDOOR TURF", category: "futsal" },
    "V003": { name: "Meja Biliard 1", img: "assets/images/meja1.png", rating: "4.9 (210 Reviews)", loc: "SudutSatu Arena Lantai 2", type: "VIP LOUNGE", category: "biliard" },
    "V005": { name: "Meja Biliard VIP", img: "assets/images/meja2.png", rating: "5.0 (150 Reviews)", loc: "SudutSatu Arena Lantai 2", type: "PREMIUM", category: "biliard" }
  };

  const urlParams = new URLSearchParams(window.location.search);
  let selectedId = urlParams.get('id') || "V002"; // Fallback ke Sintetis jika tidak ada parameter
  if (!venuesDB[selectedId]) selectedId = "V002"; 

  const venueData = venuesDB[selectedId];

  if(document.getElementById('detailVenueName')) document.getElementById('detailVenueName').textContent = venueData.name;
  if(document.getElementById('summaryVenueName')) document.getElementById('summaryVenueName').textContent = venueData.name;
  if(document.getElementById('detailMainImg')) document.getElementById('detailMainImg').src = venueData.img;
  if(document.getElementById('detailVenueLoc')) document.getElementById('detailVenueLoc').innerHTML = `&#128205; ${venueData.loc}`;
  if(document.getElementById('detailVenueRating')) document.getElementById('detailVenueRating').innerHTML = `&#11088; ${venueData.rating}`;
  if(document.querySelector('.badge-premium')) document.querySelector('.badge-premium').textContent = venueData.type;

  const dateTabsContainer = document.getElementById('dateTabsContainer');
  const today = new Date();
  const pad2 = (value) => String(value).padStart(2, '0');
  const formatExactDate = (date) => `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
  const API_BASE_URL = 'http://localhost:5000/api';
  // Cookie-based auth: use credentials: 'include' on fetch calls

  const buildTimeRange = (items) => {
    if (!items || items.length === 0) return { start: '', end: '' };
    const sorted = [...items].sort((a, b) => {
      const aStart = a.time.split(' - ')[0];
      const bStart = b.time.split(' - ')[0];
      return aStart.localeCompare(bStart, undefined, { numeric: true, sensitivity: 'base' });
    });
    return {
      start: sorted[0].time.split(' - ')[0],
      end: sorted[sorted.length - 1].time.split(' - ')[1]
    };
  };

  const fetchBookedSlots = async (exactDateStr) => {
    try {
      const url = `${API_BASE_URL}/booking/availability?venue_name=${encodeURIComponent(venueData.name)}&booking_date=${encodeURIComponent(exactDateStr)}`;
      const response = await fetch(url, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        return [];
      }
      return result.data || [];
    } catch (err) {
      console.warn('Gagal memuat jadwal terbook, lanjutkan dengan mode demo:', err);
      return [];
    }
  };

  const isSlotBooked = (slotTime, bookedBookings) => {
    if (!bookedBookings || bookedBookings.length === 0) return false;
    const [slotStart, slotEnd] = slotTime.split(' - ').map(s => s.trim());
    return bookedBookings.some(b => {
      const start = String(b.start_time || '').trim();
      const end = String(b.end_time || '').trim();
      if (!start || !end) return false;
      return !(slotEnd <= start || slotStart >= end);
    });
  };

  const createBookingOnServer = async (payload) => {
    try {
      const response = await fetch(`${API_BASE_URL}/booking`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return { bookingId: `${Date.now()}` };
      }
      return data;
    } catch (err) {
      console.warn('Booking server unavailable, continuing in demo mode:', err);
      return { bookingId: `${Date.now()}` };
    }
  };

  if (dateTabsContainer) {
    dateTabsContainer.innerHTML = ''; 
    const days = ['MINGGU', 'SENIN', 'SELASA', 'RABU', 'KAMIS', 'JUMAT', 'SABTU'];

    for (let i = 0; i < 7; i++) {
      const currentDate = new Date();
      currentDate.setDate(today.getDate() + i); 
      
      const dayName = days[currentDate.getDay()]; 
      const dateNum = currentDate.getDate(); 
      const exactDate = formatExactDate(currentDate);
      
      const isActive = i === 0 ? 'active' : '';
      const buttonHTML = `
        <button class="tab-btn ${isActive}" data-exactdate="${exactDate}" data-date="${dateNum}">
          ${dayName}<br><span class="date-num">${dateNum}</span>
        </button>
      `;
      dateTabsContainer.insertAdjacentHTML('beforeend', buttonHTML);
    }
  }

  const scheduleGrid = document.getElementById('scheduleSlots');
  let selectedItems = []; 
  const ADMIN_FEE = 2500;

  // ==========================================
  // HANYA 1 KOLOM (Karena Vinyl & Meja 2 Dihapus)
  // ==========================================
  let columns = [];
  let basePrice = 0;
  if (venueData.category === "biliard") { 
      columns = ["Meja Biliard"]; 
      basePrice = 50000; 
  } else { 
      columns = ["Lapangan Sintetis"]; 
      basePrice = 100000; 
  }

  const timeSlots = ["08:00 - 09:00", "09:00 - 10:00", "13:00 - 14:00", "15:00 - 16:00", "16:00 - 17:00", "19:00 - 20:00", "20:00 - 21:00", "21:00 - 22:00"];

  const renderSchedule = async (daySeed, exactDateStr) => {
    if(!scheduleGrid) return;
    scheduleGrid.innerHTML = '';
    scheduleGrid.style.gridTemplateColumns = `120px repeat(${columns.length}, 1fr)`;
    scheduleGrid.innerHTML += `<div class="grid-header">Time</div>`;
    columns.forEach(col => { scheduleGrid.innerHTML += `<div class="grid-header">${col}</div>`; });

    let bookedForToday = [];
    try {
      bookedForToday = await fetchBookedSlots(exactDateStr);
    } catch (err) {
      console.warn('Gagal memuat jadwal terbook:', err.message);
      bookedForToday = [];
    }

    timeSlots.forEach((time) => {
      scheduleGrid.innerHTML += `<div class="grid-time">${time}</div>`;
      columns.forEach((col) => {
        const isBooked = isSlotBooked(time, bookedForToday);
        
        if (isBooked) {
          scheduleGrid.innerHTML += `<button class="slot disabled" disabled>Booked</button>`;
        } else {
          scheduleGrid.innerHTML += `<button class="slot available" data-court="${col}" data-time="${time}" data-price="${basePrice}">Rp ${(basePrice).toLocaleString('id-ID')}</button>`;
        }
      });
    });
    attachSlotListeners();
  };

  const tabBtns = document.querySelectorAll('.tab-btn');
  tabBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      if(this.classList.contains('active')) return;
      tabBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      selectedItems = [];
      updateSummary();
      renderSchedule(this.getAttribute('data-date'), this.getAttribute('data-exactdate'));
    });
  });

  const selectedContainer = document.getElementById('selectedSlotsContainer');
  const emptyMsg = document.getElementById('emptySlotMsg');
  const txtSubtotal = document.getElementById('subtotal');
  const txtDp = document.getElementById('dpAmount');
  const txtTotalToPay = document.getElementById('totalToPay');
  const paymentStatusLabel = document.getElementById('paymentStatusLabel');

  const updateSummary = () => {
    if(!selectedContainer) return;
    selectedContainer.innerHTML = '';
    if (selectedItems.length === 0) {
      if(emptyMsg) { selectedContainer.appendChild(emptyMsg); emptyMsg.style.display = 'block'; }
      txtSubtotal.textContent = "Rp 0";
      if(txtDp) txtDp.textContent = "Rp 0";
      if(txtTotalToPay) txtTotalToPay.textContent = "Rp 0";
      return;
    }
    if(emptyMsg) emptyMsg.style.display = 'none';
    let subtotal = 0;
    selectedItems.forEach(item => {
      subtotal += item.price;
      const row = document.createElement('div');
      row.className = 'selected-item-row';
      row.innerHTML = `<div><div class="text-white bold text-small">${item.court}</div><div class="text-muted text-tiny">${item.time}</div></div><div class="text-primary bold">Rp ${(item.price).toLocaleString('id-ID')}</div>`;
      selectedContainer.appendChild(row);
    });

    const finalTotal = subtotal + ADMIN_FEE;
    const dpAmount = finalTotal / 2; 

    txtSubtotal.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    if(txtDp) txtDp.textContent = `Rp ${dpAmount.toLocaleString('id-ID')}`;
    
    const checkedRadio = document.querySelector('input[name="paymentType"]:checked');
    const paymentType = checkedRadio ? checkedRadio.value : 'split';
    
    if(paymentType === 'split') {
      if(txtTotalToPay) txtTotalToPay.textContent = `Rp ${dpAmount.toLocaleString('id-ID')}`;
      if(paymentStatusLabel) paymentStatusLabel.textContent = "INITIAL CONTRIBUTION";
    } else {
      if(txtTotalToPay) txtTotalToPay.textContent = `Rp ${finalTotal.toLocaleString('id-ID')}`;
      if(paymentStatusLabel) paymentStatusLabel.textContent = "FULL AMOUNT";
    }
  };

  function attachSlotListeners() {
    document.querySelectorAll('.slot.available').forEach(slot => {
      slot.addEventListener('click', function() {
        const court = this.getAttribute('data-court');
        const time = this.getAttribute('data-time');
        const price = parseInt(this.getAttribute('data-price'));
        if (this.classList.contains('selected')) {
          this.classList.remove('selected');
          selectedItems = selectedItems.filter(i => !(i.court === court && i.time === time));
        } else {
          this.classList.add('selected');
          selectedItems.push({ court, time, price });
        }
        updateSummary();
      });
    });
  }

  const payRadios = document.querySelectorAll('.pay-radio');
  payRadios.forEach(radioLabel => {
    const input = radioLabel.querySelector('input');
    if(input) {
      input.addEventListener('change', function() {
        payRadios.forEach(r => r.classList.remove('active-radio'));
        radioLabel.classList.add('active-radio');
        updateSummary();
      });
    }
  });

  const tfFileInput = document.getElementById('tfFileInput');
  const teamNameInput = document.getElementById('teamName');

  const getSelectedPaymentType = () => {
    const checkedRadio = document.querySelector('input[name="paymentType"]:checked');
    return checkedRadio ? checkedRadio.value : 'split';
  };

  const getSelectedTimeRange = (items) => {
    if (!items || items.length === 0) return { start: '', end: '' };
    const sorted = [...items].sort((a, b) => a.time.split(' - ')[0].localeCompare(b.time.split(' - ')[0], undefined, { numeric: true, sensitivity: 'base' }));
    const firstPart = sorted[0].time.split(' - ');
    const lastPart = sorted[sorted.length - 1].time.split(' - ');
    return { start: firstPart[0], end: lastPart[1] };
  };

  if(tfFileInput) {
    tfFileInput.addEventListener('change', function(e) {
      if(e.target.files.length > 0) {
        document.querySelectorAll('.tf-file-name').forEach(nameEl => {
          nameEl.textContent = `✅ Berhasil Upload: ${e.target.files[0].name}`;
          nameEl.style.display = 'block';
        });
        document.querySelectorAll('.btn-upload-trigger').forEach(btn => {
          btn.style.borderColor = '#ccff00'; btn.style.color = '#ccff00';
        });
      }
    });
  }

  document.querySelectorAll('.btn-upload-trigger').forEach(btn => {
    btn.addEventListener('click', (e) => {
      if (selectedItems.length === 0) {
        e.preventDefault();
        Swal.fire({ ...swalConfig, icon: 'warning', title: 'Jadwal Kosong!', text: 'Harap pilih jadwal lapangan minimal 1 slot!', confirmButtonText: '<span style="color: #000; font-weight: bold;">Pilih Jadwal</span>' }).then(() => {
          const scheduleSec = document.querySelector('.schedule-section');
          if(scheduleSec) scheduleSec.scrollIntoView({ behavior: 'smooth' });
        });
        return;
      }
      if (!teamNameInput || !teamNameInput.value.trim()) {
        e.preventDefault();
        Swal.fire({ ...swalConfig, icon: 'warning', title: 'Tunggu Dulu!', text: "Harap isi 'Team Name' terlebih dahulu!", confirmButtonText: '<span style="color: #000; font-weight: bold;">Oke, Mengerti</span>' }).then(() => {
          if(teamNameInput) teamNameInput.focus();
        });
        return;
      }
      if(tfFileInput) tfFileInput.click();
    });
  });

  let timeLeft = 600; 
  const timerDisplay = document.getElementById('timerDisplay');
  const updateTimer = () => {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    if(timerDisplay) timerDisplay.innerHTML = `⏱ ${m}:${s} Menit Tersisa`;
    if (timeLeft > 0) { timeLeft--; setTimeout(updateTimer, 1000); } 
    else {
      if(timerDisplay) timerDisplay.innerHTML = "Waktu Habis!";
      const btnSubmit = document.getElementById('btnSubmit');
      if(btnSubmit) { btnSubmit.classList.add('disabled'); btnSubmit.disabled = true; }
    }
  };
  updateTimer(); 

  const btnSubmit = document.getElementById('btnSubmit');
  if(btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      if(selectedItems.length === 0) { 
          Swal.fire({ ...swalConfig, icon: 'error', title: 'Oops...', text: 'Pilih jadwal minimal 1 slot!' }); return; 
      }
      if(!teamNameInput || !teamNameInput.value.trim()) { 
          Swal.fire({ ...swalConfig, icon: 'error', title: 'Oops...', text: 'Nama Tim wajib diisi!' }); return; 
      }
      if(tfFileInput && tfFileInput.files.length === 0) { 
          Swal.fire({ ...swalConfig, icon: 'error', title: 'Pembayaran Belum Selesai', text: 'Harap upload bukti transfer pembayaran Anda!', confirmButtonText: '<span style="color: #000; font-weight: bold;">Upload Sekarang</span>' }); return; 
      }

      btnSubmit.innerHTML = "Memverifikasi...";
      btnSubmit.style.opacity = '0.7';

      setTimeout(() => {
        const activeTab = document.querySelector('.tab-btn.active');
        const exactDateStr = activeTab ? activeTab.getAttribute('data-exactdate') : formatExactDate(today);
        const times = selectedItems.map(item => item.time).join(', ');
        const { start: startTime, end: endTime } = getSelectedTimeRange(selectedItems);
        let totalHarga = 0;
        selectedItems.forEach(item => totalHarga += item.price);

        const venueNameEl = document.getElementById('summaryVenueName');
        const paymentType = getSelectedPaymentType();
        const bookingData = {
          venue_name: venueNameEl ? venueNameEl.innerText : 'Lapangan Futsal Sintetis Indoor',
          team_name: teamNameInput.value,
          booking_date: exactDateStr,
          start_time: startTime,
          end_time: endTime,
          total_price: totalHarga,
          payment_method: paymentType === 'full' ? 'full' : 'dp',
          payment_proof: null
        };

        createBookingOnServer(bookingData)
          .then((result) => {
              // Do not persist booking data in localStorage anymore — rely on backend/database.
              Swal.fire({
                ...swalConfig,
                icon: 'success',
                title: 'Booking Berhasil! 🎉',
                text: 'Pesanan Anda telah dikirim ke server. Silakan cek detail booking untuk konfirmasi.',
                confirmButtonText: '<span style="color: #000; font-weight: bold;">Lihat Detail</span>'
              }).then(() => {
                // Redirect to success/detail page that will fetch booking from server using ID
                window.location.href = `booking-success.html?id=${result.bookingId}`;
              });
            })
          .catch((error) => {
            console.error('Booking API error:', error);
            Swal.fire({
              ...swalConfig,
              icon: 'error',
              title: 'Gagal Booking',
              text: error.message || 'Terjadi kesalahan saat mengirim booking ke server.',
              confirmButtonText: '<span style="color: #000; font-weight: bold;">Coba Lagi</span>'
            });
          });
      }, 1000);
    });
  }

  const initialActiveTab = document.querySelector('.tab-btn.active');
  const initialExactDate = initialActiveTab ? initialActiveTab.getAttribute('data-exactdate') : `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  renderSchedule(today.getDate(), initialExactDate);
});