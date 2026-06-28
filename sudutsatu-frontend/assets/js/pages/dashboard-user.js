document.addEventListener('DOMContentLoaded', async () => {

    const now = new Date();
    const formatRupiah = (angka) => 'Rp ' + Number(angka || 0).toLocaleString('id-ID');

    const formatDateToIndo = (timestamp) => {
        if (!timestamp) return '-';
        const d = new Date(timestamp);
        if (Number.isNaN(d.getTime())) return '-';
        const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
        return `${days[d.getDay()]}, ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
    };

    const formatTimeAgo = (timestamp) => {
        if (!timestamp) return 'BARU SAJA';
        const seconds = Math.floor((now.getTime() - timestamp) / 1000);
        if (seconds < 60) return 'BARU SAJA';
        if (seconds < 3600) return `${Math.floor(seconds/60)} MNT LALU`;
        if (seconds < 86400) return `${Math.floor(seconds/3600)} JAM LALU`;
        return formatDateToIndo(timestamp);
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
        const teamName = booking.team_name || booking.teamName || 'Tim Anda';
        const price = Number(booking.total_price || booking.totalPrice || booking.price || 0);
        const statusText = String(booking.status || 'pending').toLowerCase();
        let status = 'Menunggu';
        if (['paid', 'confirmed', 'success'].includes(statusText)) status = 'Lunas';
        else if (['partial', 'pending_verification', 'dp'].includes(statusText)) status = 'DP / Menunggu';
        else if (['cancelled', 'rejected'].includes(statusText)) status = 'Batal';

        const bookingTimestamp = bookingDate
            ? new Date(`${bookingDate}T${startTime || '00:00'}:00`).getTime()
            : new Date(booking.created_at || Date.now()).getTime();

        return {
            id: booking.id || booking.booking_id || booking.bookingId,
            venue: venueName,
            team: teamName,
            type: /billiard|meja|bill/.test(venueName) ? 'BILLIARD' : 'FUTSAL',
            date: bookingDate,
            timeStr: startTime && endTime ? `${startTime} - ${endTime}` : startTime || '-',
            timestamp: bookingTimestamp,
            price,
            status,
            createdAt: booking.created_at ? new Date(booking.created_at).getTime() : bookingTimestamp,
            img: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=800&q=80'
        };
    };

    let activeUserName = 'Pengguna';
    try {
        const meRes = await fetch('/api/auth/me', { method: 'GET', credentials: 'include' });
        if (meRes.ok) {
            const mePayload = await meRes.json();
            const meUser = mePayload.user || {};
            if (meUser.name) activeUserName = meUser.name;
        }
    } catch (e) {
        // Ignore session errors; page should still render for functional checks.
    }

    const navNameEl = document.querySelector('#desktopProfileText .text-white');
    if (navNameEl) navNameEl.textContent = activeUserName;

    const greetingNameEl = document.getElementById('userNameHeader');
    if (greetingNameEl) greetingNameEl.textContent = activeUserName;

    const API_BASE_URL = 'http://localhost:5000/api';

    let allBookings = [];
    const fetchMyBookings = async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/booking/my-bookings`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload.message || 'Gagal memuat booking');
            return Array.isArray(payload.data) ? payload.data.map(normalizeBooking) : [];
        } catch (err) {
            console.warn('Failed to fetch user bookings:', err);
            return [];
        }
    };

    const renderDashboard = () => {
        const todayZero = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        const upcomingBookings = allBookings.filter(b => b.timestamp >= todayZero).sort((a, b) => a.timestamp - b.timestamp);
        const pastBookings = allBookings.filter(b => b.timestamp < todayZero);

        let totalSpend = 0;
        allBookings.forEach(b => { totalSpend += Number(b.price || 0); });

        const statTotal = document.getElementById('statTotalPemesanan');
        if (statTotal) statTotal.textContent = allBookings.length;
        const statActive = document.getElementById('statJadwalAktif');
        if (statActive) statActive.textContent = upcomingBookings.length;
        const spendEl = document.getElementById('userTotalSpend');
        if (spendEl) spendEl.textContent = formatRupiah(totalSpend);

        const upcomingContainer = document.getElementById('upcomingBookingsContainer');
        if (upcomingContainer) {
            upcomingContainer.innerHTML = '';

            if (upcomingBookings.length === 0) {
                upcomingContainer.innerHTML = `<div style="border: 1px dashed #333; background: #111; border-radius: 12px; padding: 40px 20px; text-align: center; color: #888;">Belum ada pesanan mendatang.<br>Silakan booking jadwal!</div>`;
            } else {
                upcomingBookings.forEach(b => {
                    const dateStr = formatDateToIndo(b.timestamp);
                    const cardHTML = `
                        <div class="booking-card mb-16">
                            <div class="bc-image">
                                <img src="${b.img}" onerror="this.src='https://via.placeholder.com/150/1a1a1a/555'" alt="Venue">
                            </div>
                            <div class="bc-content">
                                <div class="flex-between align-center mb-8">
                                    <span class="text-tiny text-muted uppercase tracking-wide">SESI ${b.type}</span>
                                    <span class="badge-premium" style="background: #ccff00; color: #000;">${b.status}</span>
                                </div>
                                <h3 class="text-white mb-12 m-0" style="font-size: 20px;">${b.venue}</h3>
                                <div class="text-small text-muted d-flex align-center gap-16">
                                    <span>📅 ${dateStr}</span>
                                    <span>⏰ ${b.timeStr}</span>
                                </div>
                            </div>
                            <div class="bc-actions" style="justify-content: center;">
                                <button class="btn btn-primary w-100 py-12 text-small bold" onclick="window.viewTicket('${b.id}')">KODE QR</button>
                            </div>
                        </div>
                    `;
                    upcomingContainer.insertAdjacentHTML('beforeend', cardHTML);
                });
            }
        }

        const historyContainer = document.getElementById('historyBookingsContainer');
        let allActivities = [];

        allBookings.forEach(b => {
            if (b.createdAt) {
                allActivities.push({
                    title: 'Pembayaran Berhasil',
                    desc: `Booking untuk <span class="text-white">${b.venue}</span>`,
                    timeInfo: formatTimeAgo(b.createdAt),
                    timestamp: b.createdAt,
                    icon: '💸',
                    iconBg: 'rgba(204,255,0,0.1)'
                });
            }
        });

        pastBookings.forEach(b => {
            allActivities.push({
                title: 'Sesi Selesai',
                desc: `Sesi latihan di <span class="text-white">${b.venue}</span>`,
                timeInfo: formatDateToIndo(b.timestamp),
                timestamp: b.timestamp + 86400000,
                icon: '✅',
                iconBg: 'rgba(204,255,0,0.1)'
            });
        });

        allActivities.sort((a, b) => b.timestamp - a.timestamp);

        const renderHistory = (limit) => {
            if (!historyContainer) return;
            historyContainer.innerHTML = '';
            if (allActivities.length === 0) {
                historyContainer.innerHTML = `<div class="text-center text-muted py-16">Belum ada aktivitas.</div>`;
            } else {
                allActivities.slice(0, limit).forEach(act => {
                    const historyHTML = `
                        <div class="d-flex gap-12 mb-16 pb-16" style="border-bottom: 1px solid #222;">
                            <div class="flex-shrink-0" style="width: 40px; height: 40px; background: ${act.iconBg}; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 18px;">${act.icon}</div>
                            <div>
                                <h4 class="text-white mb-4 m-0" style="font-size: 14px;">${act.title}</h4>
                                <p class="text-muted text-small mb-8 m-0">${act.desc}</p>
                                <span class="text-primary text-tiny uppercase tracking-wide bold">${act.timeInfo}</span>
                            </div>
                        </div>
                    `;
                    historyContainer.insertAdjacentHTML('beforeend', historyHTML);
                });
            }
        };

        renderHistory(3);

        const btnLihatRiwayat = document.querySelector('.activity-card button');
        if (btnLihatRiwayat) {
            if (allActivities.length <= 3) {
                btnLihatRiwayat.style.display = 'none';
            } else {
                btnLihatRiwayat.onclick = (e) => {
                    e.preventDefault();
                    renderHistory(allActivities.length);
                    btnLihatRiwayat.style.display = 'none';
                };
            }
        }
    };

    allBookings = await fetchMyBookings();
    renderDashboard();
});

window.viewTicket = function(id) {
    window.location.href = `e-ticket.html?id=${encodeURIComponent(id)}`;
};