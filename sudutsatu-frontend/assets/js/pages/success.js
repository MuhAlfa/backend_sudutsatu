document.addEventListener('DOMContentLoaded', async () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  // Cookie-based auth: use credentials: 'include' for authenticated requests

  const params = new URLSearchParams(window.location.search);
  const bookingId = params.get('id');
  if (!bookingId) { window.location.href = 'index.html'; return; }

  // Do not require local token; attempts will use cookie auth

  try {
    localStorage.setItem('lastBookingId', String(bookingId));

    const res = await fetch(`${API_BASE_URL}/booking/${encodeURIComponent(bookingId)}`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
    const payload = await res.json().catch(() => ({}));
    const data = payload.data || payload.booking || payload || {};

    const displayId = data.id || data.booking_id || bookingId;
    if (document.getElementById('bId')) document.getElementById('bId').textContent = displayId;
    if (document.getElementById('bVenue')) document.getElementById('bVenue').textContent = data.venue_name || data.venue || 'Lapangan SudutSatu';

    const dateText = data.booking_date || data.exactDateStr || '';
    if (document.getElementById('bDate')) document.getElementById('bDate').textContent = dateText || 'Tanggal belum tersedia';

    const timeText = (data.start_time && data.end_time) ? `${data.start_time} - ${data.end_time}` : (data.time || '');
    if (document.getElementById('bTime')) document.getElementById('bTime').textContent = timeText ? `${timeText} WIB` : 'Waktu belum tersedia';

    const paid = data.total_price || data.totalPaid || data.price || 0;
    if (document.getElementById('bPaid')) document.getElementById('bPaid').textContent = `Rp ${parseInt(paid).toLocaleString('id-ID')}`;

  } catch (err) {
    console.warn('Error loading booking, using fallback display:', err);
    if (document.getElementById('bId')) document.getElementById('bId').textContent = bookingId;
    if (document.getElementById('bVenue')) document.getElementById('bVenue').textContent = 'Lapangan SudutSatu';
    if (document.getElementById('bDate')) document.getElementById('bDate').textContent = 'Tanggal belum tersedia';
    if (document.getElementById('bTime')) document.getElementById('bTime').textContent = 'Waktu belum tersedia';
  }

});