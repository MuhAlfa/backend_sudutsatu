document.addEventListener('DOMContentLoaded', () => {

  const swalConfig = {
    background: '#141414',
    color: '#ffffff',
    confirmButtonColor: '#ccff00',
    cancelButtonColor: '#333',
    backdrop: `rgba(0,0,0,0.8)`,
    heightAuto: false,
    scrollbarPadding: false
  };

  const API_BASE_URL = 'http://localhost:5000/api';
  // Cookie-based auth: use credentials: 'include' on fetch calls instead of reading token from localStorage

  let allBookings = [];

  const fetchAdminBookings = async () => {
    const res = await fetch(`${API_BASE_URL}/booking`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } });
    const body = await res.json();
    if (!res.ok) throw new Error(body.message || 'Gagal memuat booking admin');
    return body.data || [];
  };

  const tableBody = document.getElementById('tableBody');
  const headerCount = document.getElementById('headerStatusAngka');
  const modalDetail = document.getElementById('modalDetail');
  const closeModalBtn = document.getElementById('closeModal');
  let activeBookingId = null;

  const renderTable = () => {
    if (!tableBody) return;
    tableBody.innerHTML = '';

    const pendingBookings = allBookings.filter(b => (b.status || '').toLowerCase() === 'pending');
    
    if (headerCount) headerCount.textContent = pendingBookings.length;

    if (pendingBookings.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding: 40px; color:#555;">Tidak ada booking yang menunggu konfirmasi.</td></tr>`;
      return;
    }

    pendingBookings.forEach(booking => {
      const tr = document.createElement('tr');
      tr.className = 'table-row';
      
      const dateObj = new Date(booking.createdAt);
      const createdDate = dateObj.toLocaleDateString('id-ID');
      
      tr.innerHTML = `
        <td><span class="id-pill text-white">${booking.id}</span></td>
        <td class="text-white">${booking.venueName}</td>
        <td class="text-muted">${booking.teamName}</td>
        <td class="text-primary">${booking.times}</td>
        <td class="text-white bold">Rp ${booking.totalPrice.toLocaleString('id-ID')}</td>
        <td class="text-muted text-small">${createdDate}</td>
        <td>
          <button class="btn-action btn-detail" data-id="${booking.id}" style="background:#333; border:1px solid #555; color:#aaa; padding:6px 12px; border-radius:4px; cursor:pointer; font-size:12px;">
            Detail
          </button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    attachDetailListeners();
  };

  const attachDetailListeners = () => {
    document.querySelectorAll('.btn-detail').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const bookingId = e.target.getAttribute('data-id');
        const booking = allBookings.find(b => b.id === bookingId);
        
        if (booking && modalDetail) {
          activeBookingId = bookingId;
          
          // Isi modal dengan detail booking
          const dateObj = new Date(booking.exactDateStr + ' 00:00:00');
          const displayDate = dateObj.toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
          
          document.getElementById('detailVenue').textContent = booking.venueName;
          document.getElementById('detailCourt').textContent = booking.court;
          document.getElementById('detailDate').textContent = displayDate;
          document.getElementById('detailTime').textContent = booking.times;
          document.getElementById('detailTeam').textContent = booking.teamName;
          document.getElementById('detailUser').textContent = booking.userName;
          document.getElementById('detailPrice').textContent = `Rp ${booking.price.toLocaleString('id-ID')}`;
          document.getElementById('detailAdminFee').textContent = `Rp ${booking.adminFee.toLocaleString('id-ID')}`;
          document.getElementById('detailTotal').textContent = `Rp ${booking.totalPrice.toLocaleString('id-ID')}`;
          
          modalDetail.classList.remove('hidden');
          modalDetail.style.display = 'flex';
        }
      });
    });
  };

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modalDetail.style.display = 'none';
      modalDetail.classList.add('hidden');
      activeBookingId = null;
    });
  }

  const btnConfirm = document.getElementById('btnConfirm');
  const btnReject = document.getElementById('btnReject');

  if (btnConfirm) {
    btnConfirm.addEventListener('click', () => {
      if (!activeBookingId) return;

      const booking = allBookings.find(b => b.id === activeBookingId);
      if (!booking) return;

      Swal.fire({
        ...swalConfig,
        icon: 'question',
        title: 'Konfirmasi Booking?',
        text: `Jadwal ${booking.teamName} pada ${booking.times} akan dikonfirmasi.`,
        showCancelButton: true,
        confirmButtonText: '<span style="color: #000; font-weight: bold;">Ya, Konfirmasi</span>',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          // Ubah status menjadi confirmed
          const bookingIndex = allBookings.findIndex(b => b.id === activeBookingId);
          if (bookingIndex !== -1) {
            // Update on server
            (async () => {
              try {
                await fetch(`${API_BASE_URL}/booking/${encodeURIComponent(booking.id)}`, {
                  method: 'PUT',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'confirmed' })
                });
              } catch (err) { console.warn('Failed to update booking on server:', err); }
            })();
            allBookings[bookingIndex].status = 'confirmed';
            allBookings[bookingIndex].confirmedAt = new Date().toISOString();
          }

          Swal.fire({
            ...swalConfig,
            icon: 'success',
            title: 'Booking Dikonfirmasi!',
            text: `Booking ${activeBookingId} telah dikonfirmasi. E-ticket telah dikirim.`,
            confirmButtonText: '<span style="color: #000; font-weight: bold;">Tutup</span>',
            timer: 2000
          });

          modalDetail.style.display = 'none';
          modalDetail.classList.add('hidden');
          activeBookingId = null;
          renderTable();
        }
      });
    });
  }

  if (btnReject) {
    btnReject.addEventListener('click', () => {
      if (!activeBookingId) return;

      Swal.fire({
        ...swalConfig,
        icon: 'warning',
        title: 'Tolak Booking',
        input: 'text',
        inputLabel: 'Alasan penolakan',
        inputPlaceholder: 'Misal: Lapangan penuh, konflik jadwal',
        showCancelButton: true,
        confirmButtonColor: '#ff5555',
        confirmButtonText: 'Tolak Booking',
        cancelButtonText: 'Batal',
        preConfirm: (alasan) => {
          if (!alasan) {
            Swal.showValidationMessage('Alasan penolakan WAJIB diisi!');
          }
          return alasan;
        }
      }).then((result) => {
        if (result.isConfirmed) {
          const alasan = result.value;
          const bookingIndex = allBookings.findIndex(b => b.id === activeBookingId);
          
          if (bookingIndex !== -1) {
            (async () => {
              try {
                await fetch(`${API_BASE_URL}/booking/${encodeURIComponent(activeBookingId)}`, {
                  method: 'PUT',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ status: 'rejected', rejectionReason: alasan })
                });
              } catch (err) { console.warn('Failed to update booking status on server:', err); }
            })();
            allBookings[bookingIndex].status = 'rejected';
            allBookings[bookingIndex].rejectionReason = alasan;
            allBookings[bookingIndex].rejectedAt = new Date().toISOString();
          }

          Swal.fire({
            ...swalConfig,
            icon: 'info',
            title: 'Booking Ditolak',
            text: `Alasan: ${alasan}`,
            confirmButtonText: '<span style="color: #000; font-weight: bold;">Tutup</span>',
            timer: 2500
          });

          modalDetail.style.display = 'none';
          modalDetail.classList.add('hidden');
          activeBookingId = null;
          renderTable();

          // Initial load from server
          (async () => {
            try {
              allBookings = await fetchAdminBookings();
              renderTable();
            } catch (err) {
              console.warn('Could not load admin bookings:', err);
              allBookings = [];
              renderTable();
            }
          })();
        }
      });
    });
  }

  renderTable();
});
