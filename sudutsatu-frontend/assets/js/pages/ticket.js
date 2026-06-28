document.addEventListener('DOMContentLoaded', () => {
    const initTicket = async () => {
        const API_BASE_URL = 'http://localhost:5000/api';
        // Cookie-based auth: use credentials: 'include' for authenticated requests
        const params = new URLSearchParams(window.location.search);
        const requestedBookingId = params.get('id') || params.get('bookingId') || localStorage.getItem('lastBookingId') || localStorage.getItem('latestBookingId');
        let bookingId = requestedBookingId;

        // Do not depend on local token; attempts to fetch will use cookie-based auth.

        if (!bookingId) {
            try {
                const fallbackRes = await fetch(`${API_BASE_URL}/booking/my-bookings`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
                const fallbackPayload = await fallbackRes.json();
                if (fallbackRes.ok) {
                    const fallbackBookings = Array.isArray(fallbackPayload.data) ? fallbackPayload.data : [];
                    bookingId = fallbackBookings[0]?.id || fallbackBookings[0]?.booking_id || null;
                    if (bookingId) {
                        localStorage.setItem('lastBookingId', String(bookingId));
                    }
                }
            } catch (err) {
                console.warn('No recent booking found:', err);
            }
        }

        if (!bookingId) {
            const fallbackMessage = document.getElementById('ticketId');
            if (fallbackMessage) fallbackMessage.textContent = 'SS-00000';
            const fallbackVenue = document.getElementById('tVenue');
            if (fallbackVenue) fallbackVenue.textContent = 'Lapangan SudutSatu';
            return;
        }

        let data = null;
        try {
            const res = await fetch(`${API_BASE_URL}/booking/${encodeURIComponent(bookingId)}`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
            const payload = await res.json();
            if (!res.ok) throw new Error(payload.message || 'Gagal memuat booking');
            data = payload.data || payload.booking || payload;
        } catch (err) {
            console.warn('Fetch booking failed, using fallback ticket view:', err);
            const ticketIdEl = document.getElementById('ticketId');
            if (ticketIdEl) ticketIdEl.textContent = 'SS-00000';
            const venueEl = document.getElementById('tVenue');
            if (venueEl) venueEl.textContent = 'Lapangan SudutSatu';
            return;
        }

        // Prefer server-side session for user display name
        let namaPemesan = data.user_name || data.userName || data.team_name || data.teamName || null;
        try {
            const meRes = await fetch(`${API_BASE_URL}/auth/me`, { method: 'GET', credentials: 'include' });
            if (meRes.ok) {
                const mePayload = await meRes.json();
                const meUser = mePayload.user || {};
                namaPemesan = meUser.name || namaPemesan;
            } else {
                const sessionStr = localStorage.getItem('userSession');
                const sessionData = sessionStr ? JSON.parse(sessionStr) : {};
                namaPemesan = sessionData.name || namaPemesan;
            }
        } catch (e) {
            namaPemesan = namaPemesan || 'Customer SudutSatu';
        }
        namaPemesan = namaPemesan || 'Customer SudutSatu';

        const randomId = Math.floor(10000 + Math.random() * 90000);
        const ticketIdText = 'SS-' + randomId;
        const ticketIdEl = document.getElementById('ticketId');
        if (ticketIdEl) ticketIdEl.textContent = ticketIdText;

        const venueName = data.venue_name || data.venueName || data.venue || 'Lapangan SudutSatu';
        const teamName = data.team_name || data.teamName || 'Tim SudutSatu';
        const startTime = data.start_time || data.time || '10:00';
        const endTime = data.end_time || data.endTime || '11:00';
        const waktuJam = `${startTime} - ${endTime} WIB`;

        const venueEl = document.getElementById('tVenue');
        if (venueEl) venueEl.textContent = venueName;

        const teamEl = document.getElementById('tTeam');
        if (teamEl) teamEl.textContent = teamName;

        const timeEl = document.getElementById('tTime');
        if (timeEl) timeEl.textContent = waktuJam;

        const rawDate = data.booking_date || data.date || data.exactDateStr || '';
        let finalDateText = rawDate;
        if (rawDate) {
            const parsedDate = new Date(rawDate);
            if (!Number.isNaN(parsedDate.getTime())) {
                const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt', 'Nov', 'Des'];
                finalDateText = `${days[parsedDate.getDay()]}, ${parsedDate.getDate()} ${months[parsedDate.getMonth()]} ${parsedDate.getFullYear()}`;
            }
        }
        const dateEl = document.getElementById('tDate');
        if (dateEl) dateEl.textContent = finalDateText || 'Tanggal Tidak Diketahui';

        let finalPrice = data.total_price || data.totalPaid || data.price || 0;
        if (typeof finalPrice === 'number' || !String(finalPrice).includes('Rp')) {
            finalPrice = 'Rp ' + parseInt(finalPrice).toLocaleString('id-ID');
        }
        const priceEl = document.getElementById('tPaid');
        if (priceEl) priceEl.textContent = finalPrice;

        const qrImg = document.getElementById('qrCodeImg');
        if (qrImg) {
            const qrDataText = `Booking ID: ${ticketIdText}\nPemesan: ${namaPemesan}\nVenue: ${venueName}\nTanggal: ${finalDateText}\nJam: ${waktuJam}`;
            const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrDataText)}&bgcolor=ffffff&color=000000`;

            try {
                const response = await fetch(qrUrl);
                const blob = await response.blob();
                const reader = new FileReader();
                reader.onloadend = () => {
                    qrImg.src = reader.result;
                };
                reader.readAsDataURL(blob);
            } catch (err) {
                console.warn('QR generation failed, falling back to URL.', err);
                qrImg.src = qrUrl;
            }
        }

        const btnDownload = document.getElementById('btnDownload');
        if (btnDownload) {
            btnDownload.addEventListener('click', () => {
                window.print();
            });
        }
    };

    initTicket();
});