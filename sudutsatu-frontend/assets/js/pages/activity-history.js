document.addEventListener('DOMContentLoaded', () => {

  const timelineContainer = document.getElementById('timelineContainer');

  // Fetch user's latest booking from server and show as activity
  (async () => {
    const API_BASE_URL = 'http://localhost:5000/api';
    if (!timelineContainer) return;
    try {
      const res = await fetch(`${API_BASE_URL}/booking/my-bookings`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) return;
      const bookings = payload.data || [];
      if (bookings.length === 0) return;
      const data = bookings[0];

      const now = new Date();
      const timeString = now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0') + " WIB";

      const todayGroup = document.createElement('div');
      todayGroup.className = 'timeline-group mt-32';
      todayGroup.innerHTML = `
        <div class="timeline-date text-primary">HARI INI</div>
        
        <div class="timeline-item" data-category="transaction">
          <div class="timeline-icon transaction">💸</div>
          <div class="timeline-content" style="border-color: rgba(204, 255, 0, 0.3);">
            <div class="flex-between align-start flex-wrap gap-8">
              <div>
                <h4 class="m-0 text-white text-base">Pembayaran Berhasil</h4>
                <p class="m-0 text-muted text-small mt-4">Booking untuk <strong class="text-white">${data.venue_name || data.venue}</strong> telah dikonfirmasi. Total dibayar: Rp ${parseInt(data.total_price || data.price || 0).toLocaleString('id-ID')}</p>
              </div>
              <span class="timeline-time text-primary text-tiny uppercase tracking-wide bold">${timeString}</span>
            </div>
          </div>
        </div>
      `;

      timelineContainer.insertBefore(todayGroup, timelineContainer.firstChild);
    } catch (err) {
      console.warn('Failed to load activity history:', err);
    }
  })();

  // 2. LOGIKA FITUR FILTER (MENYARING AKTIVITAS)
  const filterBtns = document.querySelectorAll('.filter-btn');
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      
      // A. Pindahkan status warna tombol 'active'
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const selectedFilter = this.getAttribute('data-filter');
      const timelineGroups = document.querySelectorAll('.timeline-group');

      // B. Periksa setiap item di dalam timeline
      timelineGroups.forEach(group => {
        const items = group.querySelectorAll('.timeline-item');
        let hasVisibleItem = false; // Penanda apakah grup ini punya item yang tampil

        items.forEach(item => {
          const category = item.getAttribute('data-category');
          
          // Tampilkan jika filternya "all" atau cocok dengan kategorinya
          if (selectedFilter === 'all' || category === selectedFilter) {
            item.style.display = 'block';
            hasVisibleItem = true;
          } else {
            item.style.display = 'none'; // Sembunyikan item yang tidak cocok
          }
        });

        // C. Sembunyikan Label Tanggal (HARI INI / KEMARIN) jika isinya kosong!
        if (hasVisibleItem) {
          group.style.display = 'block';
        } else {
          group.style.display = 'none';
        }
      });

    });
  });

});