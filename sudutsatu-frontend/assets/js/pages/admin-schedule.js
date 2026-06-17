document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. DATA DUMMY
  // ==========================================
  const dummyBookings = [
    { id: "BK001", teamName: "Tampomas FC", venue: "GOR Tadjimalela", sport: "Futsal", date: "2025-04-26", time: "16:00", status: "paid" },
    { id: "BK002", teamName: "Sumedang FC", venue: "GOR Tadjimalela", sport: "Futsal", date: "2025-04-29", time: "16:00", status: "partial" },
    { id: "BK003", teamName: "Cimalaka Boys", venue: "GOR Tadjimalela", sport: "Futsal", date: "2025-04-25", time: "17:00", status: "paid" },
    { id: "BK004", teamName: "Garuda FC", venue: "GOR Tadjimalela", sport: "Futsal", date: "2025-04-29", time: "17:00", status: "partial" },
    { id: "BK005", teamName: "Biliar Squad", venue: "Billiar Sudutsatu", sport: "Biliar", date: "2025-04-26", time: "19:00", status: "pending" }
  ];

  const operationalHours = ['16:00', '17:00', '18:00', '19:00', '20:00', '21:00'];
  const currentWeekDays = [
    { name: 'SEN', num: '24', full: '2025-04-24' },
    { name: 'SEL', num: '25', full: '2025-04-25' },
    { name: 'RAB', num: '26', full: '2025-04-26', isActive: true },
    { name: 'KAM', num: '27', full: '2025-04-27' },
    { name: 'JUM', num: '28', full: '2025-04-28' },
    { name: 'SAB', num: '29', full: '2025-04-29' },
    { name: 'MIN', num: '30', full: '2025-04-30' }
  ];

  // ==========================================
  // 2. ELEMENTS
  // ==========================================
  let currentSport = 'Futsal';
  let currentVenue = 'GOR Tadjimalela';

  const sportTabs = document.querySelectorAll('.sport-tab');
  const venueFilter = document.getElementById('venueFilter');
  const btnPrevWeek = document.getElementById('btnPrevWeek');
  const btnNextWeek = document.getElementById('btnNextWeek');
  
  const scheduleHead = document.getElementById('scheduleHead');
  const scheduleBody = document.getElementById('scheduleBody');
  const scheduleContainer = document.getElementById('scheduleContainer');
  
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

  const getFilteredBookings = () => dummyBookings.filter(b => b.sport === currentSport && b.venue === currentVenue);
  const findBooking = (filteredData, date, time) => filteredData.find(b => b.date === date && b.time === time);

  // ==========================================
  // 4. RENDER LOGIC
  // ==========================================
  const renderSchedule = () => {
    scheduleContainer.classList.add('hidden');
    errorState.classList.add('hidden');
    loadingState.classList.remove('hidden');

    setTimeout(() => {
      try {
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
          operationalHours.forEach(hour => {
            const trBody = document.createElement('tr');
            trBody.innerHTML = `<td class="td-time-label">${hour}</td>`;

            currentWeekDays.forEach(day => {
              const booking = findBooking(filteredData, day.full, hour);
              const td = document.createElement('td');

              if (booking) {
                const badge = getBadgeConfig(booking.status);
                td.innerHTML = `
                  <div class="sch-card" data-id="${booking.id}">
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
        loadingState.classList.add('hidden');
        errorState.classList.remove('hidden');
      }
    }, 600);
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
    venueFilter.addEventListener('change', (e) => {
      currentVenue = e.target.value;
      renderSchedule();
    });
  }

  if(btnPrevWeek) btnPrevWeek.addEventListener('click', () => renderSchedule());
  if(btnNextWeek) btnNextWeek.addEventListener('click', () => renderSchedule());
  if(btnRetry) btnRetry.addEventListener('click', () => renderSchedule());

  const attachCardListeners = () => {
    document.querySelectorAll('.sch-card').forEach(card => {
      card.addEventListener('click', function() {
        const booking = dummyBookings.find(b => b.id === this.getAttribute('data-id'));
        if(booking) {
          document.getElementById('modalBookingId').textContent = `#${booking.id}`;
          document.getElementById('modalTeamName').textContent = booking.teamName;
          document.getElementById('modalVenue').textContent = booking.venue;
          document.getElementById('modalDate').textContent = booking.date;
          document.getElementById('modalTime').textContent = booking.time;
          
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