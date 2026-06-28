document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. DATA DUMMY
  // ==========================================
  const defaultBookings = [
    { id: "BK001", teamName: "Tampomas FC", venue: "GOR Tadjimalela", sport: "Futsal", date: "2025-04-26", time: "16:00", status: "paid" },
    { id: "BK002", teamName: "Sumedang FC", venue: "GOR Tadjimalela", sport: "Futsal", date: "2025-04-29", time: "16:00", status: "partial" },
    { id: "BK003", teamName: "Cimalaka Boys", venue: "GOR Tadjimalela", sport: "Futsal", date: "2025-04-25", time: "17:00", status: "paid" },
    { id: "BK004", teamName: "Garuda FC", venue: "GOR Tadjimalela", sport: "Futsal", date: "2025-04-29", time: "17:00", status: "partial" },
    { id: "BK005", teamName: "Biliar Squad", venue: "Billiar Sudutsatu", sport: "Biliar", date: "2025-04-26", time: "19:00", status: "pending" }
  ];

  const VENUE_STORAGE_KEY = 'sudutsatu_venues';
  const BOOKING_STORAGE_KEY = 'sudutsatu_bookings';
  const API_BASE_URL = 'http://localhost:5000/api';

  const loadVenueData = () => {
    const stored = localStorage.getItem(VENUE_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch (err) {
        console.warn('Invalid venue storage:', err);
      }
    }
    return [];
  };

  const normalizeDateValue = (value) => {
    if (!value) return '';
    const raw = String(value).trim();
    if (!raw) return '';

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return `${parsed.getFullYear()}-${String(parsed.getMonth() + 1).padStart(2, '0')}-${String(parsed.getDate()).padStart(2, '0')}`;
    }

    return raw.includes('T') ? raw.split('T')[0] : raw;
  };

  const normalizeTimeValue = (value) => {
    if (!value) return '';
    const raw = String(value).trim();
    if (!raw) return '';

    if (/^\d{1,2}:\d{2}/.test(raw)) {
      const [hours, minutes] = raw.split(':');
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    const parsed = new Date(raw);
    if (!Number.isNaN(parsed.getTime())) {
      return `${String(parsed.getHours()).padStart(2, '0')}:${String(parsed.getMinutes()).padStart(2, '0')}`;
    }

    return raw.slice(0, 5);
  };

  const mapBookingToSchedule = (booking) => {
    const status = String(booking.status || booking.payment_status || '').toLowerCase();
    let mappedStatus = 'pending';
    if (status === 'paid' || status === 'confirmed' || status === 'success') mappedStatus = 'paid';
    else if (status === 'partial' || booking.payment_method === 'dp' || status === 'pending_verification') mappedStatus = 'partial';
    else if (status === 'cancelled' || status === 'rejected') mappedStatus = 'cancelled';

    const venueName = String(booking.venue_name || booking.venue || booking.venueName || '').toLowerCase();
    const sport = /billiard|meja|bill/.test(venueName) ? 'Biliar' : 'Futsal';
    const venue = /billiard|meja|bill/.test(venueName) ? 'Billiar Sudutsatu' : /sintetis|indoor/.test(venueName) ? 'Lapangan Sintetis' : 'GOR Tadjimalela';

    const date = normalizeDateValue(booking.booking_date || booking.date || '');
    const timeValue = booking.start_time || booking.time || '';
    const time = normalizeTimeValue(timeValue);

    return {
      id: String(booking.id || booking.bookingId || booking.booking_id || `BK${Math.random().toString(36).slice(2, 8)}`),
      teamName: booking.team_name || booking.teamName || booking.user_name || 'Tanpa Nama',
      userName: booking.user_name || booking.userName || booking.name || 'Tanpa Nama',
      userEmail: booking.user_email || booking.userEmail || booking.email || '-',
      userPhone: booking.user_phone || booking.userPhone || booking.phone || '-',
      venue,
      sport,
      date,
      time,
      endTime: booking.end_time || booking.endTime || '',
      paymentMethod: booking.payment_method || booking.paymentMethod || 'Belum dipilih',
      totalPrice: booking.total_price || booking.totalPrice || 0,
      status: mappedStatus,
      raw: booking
    };
  };

  const loadBookingData = async () => {
    const fallbackBookings = defaultBookings.map(mapBookingToSchedule);

    try {
      const response = await fetch(`${API_BASE_URL}/booking`, { method: 'GET', credentials: 'include' });

      if (!response.ok) {
        throw new Error('Gagal memuat booking dari server');
      }

      const result = await response.json();
      const rows = Array.isArray(result.data) ? result.data : [];
      const mapped = rows.map(mapBookingToSchedule);
      localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(mapped));
      return mapped;
    } catch (err) {
      console.warn('Falling back to local booking data:', err);
      const stored = localStorage.getItem(BOOKING_STORAGE_KEY);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map(mapBookingToSchedule);
          }
        } catch (parseErr) {
          console.warn('Invalid booking storage:', parseErr);
        }
      }
      return fallbackBookings;
    }
  };

  const persistBookingData = (data) => {
    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(data));
  };

  const venueData = loadVenueData();
  let bookingData = [];

  const operationalHours = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  const getCurrentWeekDays = () => {
    const today = new Date();
    const day = today.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const start = new Date(today);
    start.setDate(today.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      const dayNames = ['MIN', 'SEN', 'SEL', 'RAB', 'KAM', 'JUM', 'SAB'];
      return {
        name: dayNames[date.getDay()],
        num: String(date.getDate()).padStart(2, '0'),
        full: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`,
        isActive: date.toDateString() === today.toDateString()
      };
    });
  };
  const currentWeekDays = getCurrentWeekDays();

  // ==========================================
  // 2. ELEMENTS
  // ==========================================
  let currentSport = 'Futsal';
  let currentVenue = venueData.length > 0 ? venueData[0].name : 'GOR Tadjimalela';

  const sportTabs = document.querySelectorAll('.sport-tab');
  const venueFilter = document.getElementById('venueFilter');
  const btnPrevWeek = document.getElementById('btnPrevWeek');
  const btnNextWeek = document.getElementById('btnNextWeek');
  
  const scheduleHead = document.getElementById('scheduleHead');
  const scheduleBody = document.getElementById('scheduleBody');
  const scheduleContainer = document.getElementById('scheduleContainer');

  const buildVenueFilterOptions = () => {
    if (!venueFilter) return;

    const venueNames = Array.from(new Set([
      ...venueData.map(v => v.name),
      ...bookingData.map(b => b.venue).filter(Boolean)
    ]));

    if (venueNames.length === 0) {
      venueFilter.innerHTML = '';
      return;
    }

    venueFilter.innerHTML = venueNames.map(v => `<option value="${v}">${v}</option>`).join('');
    if (!venueNames.includes(currentVenue)) {
      currentVenue = venueNames[0];
    }
    venueFilter.value = currentVenue;
  };
  
  const loadingState = document.getElementById('loadingState');
  const errorState = document.getElementById('errorState');
  const btnRetry = document.getElementById('btnRetry');

  const modalBookingDetail = document.getElementById('modalBookingDetail');
  const closeModalBooking = document.getElementById('closeModalBooking');
  const btnTutupModalBawah = document.getElementById('btnTutupModalBawah');

  // ==========================================
  // 3. UTILITIES
  // ==========================================
  const getBadgeConfig = (status) => {
    switch(status) {
      case 'paid': return { text: 'LUNAS', class: 'sch-badge-lunas' };
      case 'partial': return { text: 'DP 50%', class: 'sch-badge-dp' };
      case 'pending': return { text: 'MENUNGGU', class: 'sch-badge-menunggu' };
      case 'cancelled': return { text: 'DIBATALKAN', class: 'sch-badge-batal' };
      default: return { text: 'UNKNOWN', class: 'sch-badge-dark' };
    }
  };

  const getFilteredBookings = () => bookingData.filter(b => {
    const matchesSport = b.sport === currentSport;
    const matchesVenue = b.venue === currentVenue;
    const isActiveBooking = !['cancelled', 'rejected', 'failed'].includes(String(b.status || '').toLowerCase());
    return matchesSport && matchesVenue && isActiveBooking;
  });
  const getScheduleTimeSlots = (filteredData) => {
    const slots = new Set([
      ...operationalHours,
      ...filteredData.map(b => b.time).filter(Boolean)
    ]);

    return Array.from(slots).sort((a, b) => {
      const [aH, aM] = a.split(':').map(Number);
      const [bH, bM] = b.split(':').map(Number);
      return aH - bH || aM - bM;
    });
  };
  const findBooking = (filteredData, date, time) => filteredData.find(b => b.date === date && b.time === time);

  // ==========================================
  // 4. RENDER LOGIC
  // ==========================================
  const renderSchedule = async () => {
    scheduleContainer.classList.add('hidden');
    errorState.classList.add('hidden');
    loadingState.classList.remove('hidden');

    try {
      if (bookingData.length === 0) {
        bookingData = await loadBookingData();
      }

      buildVenueFilterOptions();
      const filteredData = getFilteredBookings();
      scheduleHead.innerHTML = '';
        scheduleBody.innerHTML = '';

        // Header Table
        const trHead = document.createElement('tr');
        trHead.innerHTML = `<th class="th-waktu">WAKTU</th>`;
        currentWeekDays.forEach(day => {
          const activeClass = day.isActive ? 'active-day' : '';
          trHead.innerHTML += `<th class="${activeClass}"><span class="th-day-name">${day.name}</span><span class="th-day-number">${day.num}</span></th>`;
        });
        scheduleHead.appendChild(trHead);

        // Body Table
        if (filteredData.length === 0) {
          scheduleBody.innerHTML = `<tr class="empty-table-row"><td colspan="8">Tidak ada jadwal pada minggu ini.</td></tr>`;
        } else {
          const timeSlots = getScheduleTimeSlots(filteredData);
          timeSlots.forEach(hour => {
            const trBody = document.createElement('tr');
            trBody.innerHTML = `<td class="td-time-label">${hour}</td>`;

            currentWeekDays.forEach(day => {
              const booking = findBooking(filteredData, day.full, hour);
              const td = document.createElement('td');

              if (booking) {
                const badge = getBadgeConfig(booking.status);
                td.innerHTML = `
                  <div class="sch-card status-${booking.status}" data-id="${booking.id}">
                    <h4 class="sch-team-name">${booking.teamName}</h4>
                    <div class="sch-badge-container">
                      <span class="sch-badge ${badge.class}">${badge.text}</span>
                      <svg viewBox="0 0 24 24" width="12" height="12" stroke="currentColor" stroke-width="2" fill="none" class="sch-gear-icon"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    </div>
                  </div>
                `;
              }
              trBody.appendChild(td);
            });
            scheduleBody.appendChild(trBody);
          });
        }
        
        attachCardListeners();
        
        loadingState.classList.add('hidden');
        scheduleContainer.classList.remove('hidden');

    } catch (err) {
      console.error('Gagal render jadwal:', err);
      loadingState.classList.add('hidden');
      errorState.classList.remove('hidden');
    }
  };

  // ==========================================
  // 5. EVENT LISTENERS
  // ==========================================
  sportTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      sportTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      currentSport = e.target.getAttribute('data-sport');
      renderSchedule();
    });
  });

  if(venueFilter) {
    buildVenueFilterOptions();
    venueFilter.addEventListener('change', (e) => {
      currentVenue = e.target.value;
      renderSchedule();
    });
  }

  if(btnPrevWeek) btnPrevWeek.addEventListener('click', () => renderSchedule());
  if(btnNextWeek) btnNextWeek.addEventListener('click', () => renderSchedule());
  if(btnRetry) btnRetry.addEventListener('click', () => { bookingData = []; renderSchedule(); });

  const attachCardListeners = () => {
    document.querySelectorAll('.sch-card').forEach(card => {
      card.addEventListener('click', function() {
        const booking = bookingData.find(b => b.id === this.getAttribute('data-id'));
        if(booking) {
          const formatCurrency = (value) => {
            const num = Number(value || 0);
            return `Rp ${num.toLocaleString('id-ID')}`;
          };

          document.getElementById('modalBookingId').textContent = `#${booking.id}`;
          document.getElementById('modalUserName').textContent = booking.userName || '-';
          document.getElementById('modalUserEmail').textContent = booking.userEmail || '-';
          document.getElementById('modalUserPhone').textContent = booking.userPhone || '-';
          document.getElementById('modalTeamName').textContent = booking.teamName || '-';
          document.getElementById('modalVenue').textContent = booking.venue || '-';
          document.getElementById('modalDate').textContent = booking.date || '-';
          document.getElementById('modalTime').textContent = `${booking.time || '-'}${booking.endTime ? ` - ${booking.endTime}` : ''}`;
          document.getElementById('modalPaymentMethod').textContent = booking.paymentMethod || '-';
          document.getElementById('modalTotalPrice').textContent = formatCurrency(booking.totalPrice);
          
          const badge = getBadgeConfig(booking.status);
          document.getElementById('modalStatusContainer').innerHTML = `<span class="sch-badge ${badge.class}" style="font-size:12px; padding:6px 12px;">${badge.text}</span>`;
          
          modalBookingDetail.classList.remove('hidden');
        }
      });
    });
  };

  const closeMyModal = () => modalBookingDetail.classList.add('hidden');
  if(closeModalBooking) closeModalBooking.addEventListener('click', closeMyModal);
  if(btnTutupModalBawah) btnTutupModalBawah.addEventListener('click', closeMyModal);

  renderSchedule();
});