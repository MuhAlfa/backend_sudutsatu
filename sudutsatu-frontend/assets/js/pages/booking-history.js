document.addEventListener('DOMContentLoaded', async () => {

    const formatRupiah = (angka) => 'Rp ' + Number(angka || 0).toLocaleString('id-ID');
    const formatDateToIndo = (timestamp) => {
        if (!timestamp) return '-';
        const d = new Date(timestamp);
        if (Number.isNaN(d.getTime())) return '-';
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
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

    const normalizeBooking = (booking) => {
        const bookingDate = normalizeDateValue(booking.booking_date || booking.date || booking.created_at || '');
        const startTime = normalizeTimeValue(booking.start_time || booking.time || '');
        const endTime = normalizeTimeValue(booking.end_time || booking.endTime || '');
        const venueName = booking.venue_name || booking.venue || booking.venueName || 'Venue SudutSatu';
        const teamName = booking.team_name || booking.teamName || 'Tim SudutSatu';
        const price = Number(booking.total_price || booking.totalPrice || booking.price || 0);
        const bookingTimestamp = bookingDate ? new Date(`${bookingDate}T${startTime || '00:00'}:00`).getTime() : new Date(booking.created_at || Date.now()).getTime();

        return {
            id: booking.id || booking.booking_id || booking.bookingId,
            venue: venueName,
            teamName,
            timestamp: bookingTimestamp,
            createdAt: bookingTimestamp,
            price,
            timeStr: startTime && endTime ? `${startTime} - ${endTime}` : startTime || '-',
            img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80'
        };
    };

    const API_BASE_URL = 'http://localhost:5000/api';
    const fetchMyBookings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/booking/my-bookings`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) return [];
            return Array.isArray(payload.data) ? payload.data.map(normalizeBooking) : [];
        } catch (err) {
            console.warn('Failed to fetch bookings:', err);
            return [];
        }
    };

    const allBookings = await fetchMyBookings();
    const historyContainer = document.getElementById('fullHistoryContainer');

    if (historyContainer) {
        historyContainer.innerHTML = '';

        if (allBookings.length === 0) {
            historyContainer.innerHTML = `
                <div style="border: 1px dashed #333; background: #111; border-radius: 12px; padding: 60px 20px; text-align: center;">
                    <h3 class="text-white mb-8">Belum Ada Riwayat</h3>
                    <p class="text-muted mb-24">Anda belum pernah melakukan booking lapangan apapun.</p>
                    <button class="btn btn-primary py-12 px-24 bold" onclick="window.location.href='search-venues.html'">Cari Lapangan Sekarang</button>
                </div>`;
            return;
        }

        allBookings.sort((a, b) => b.createdAt - a.createdAt);
        const now = new Date().getTime();

        allBookings.forEach(b => {
            const dateStr = formatDateToIndo(b.timestamp);
            const isDone = b.timestamp < now;
            const statusBadge = isDone
                ? '<span class="badge-done">✅ SESI SELESAI</span>'
                : '<span class="badge-premium" style="background: #ccff00; color: #000;">⏳ TERKONFIRMASI</span>';

            const finalPrice = formatRupiah(b.price || 0);
            const cardHTML = `
                <div class="history-card">
                    <div class="flex-between align-center mb-16">
                        <span class="text-muted text-small uppercase tracking-wide">ID: <span class="text-primary bold">${b.id}</span></span>
                        ${statusBadge}
                    </div>

                    <div class="d-flex align-center gap-16 mb-16">
                        <img src="${b.img}" onerror="this.src='https://via.placeholder.com/150'" style="width: 100px; height: 70px; border-radius: 8px; object-fit: cover;">
                        <div>
                            <h3 class="text-white m-0 mb-4" style="font-size: 18px;">${b.venue}</h3>
                            <p class="text-muted m-0 text-small">Nama Tim: <span class="text-white">${b.teamName || 'Tim SudutSatu'}</span></p>
                        </div>
                    </div>

                    <div class="flex-between align-center" style="border-top: 1px dashed #333; padding-top: 16px;">
                        <div class="text-small text-muted d-flex align-center gap-16">
                            <span>📅 ${dateStr}</span>
                            <span>⏰ ${b.timeStr}</span>
                        </div>
                        <div class="text-right">
                            <span class="text-primary bold" style="font-size: 16px;">${finalPrice}</span>
                        </div>
                    </div>
                </div>
            `;
            historyContainer.insertAdjacentHTML('beforeend', cardHTML);
        });
    }
});