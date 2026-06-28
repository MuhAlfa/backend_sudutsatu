document.addEventListener('DOMContentLoaded', () => {
  const draft = AppStorage.getDraft();
  if (!draft) { window.location.href = 'index.html'; return; }

  // Set Data
  document.getElementById('payAmount').textContent = `Rp ${draft.amountToPayNow.toLocaleString('id-ID')}`;
  document.getElementById('payLabel').textContent = `Metode: ${draft.paymentMethod}`;

  // Countdown Logic (10 Menit)
  let time = 600; 
  const timerEl = document.getElementById('timer');
  const interval = setInterval(() => {
    const m = Math.floor(time / 60).toString().padStart(2, '0');
    const s = (time % 60).toString().padStart(2, '0');
    timerEl.textContent = `${m}:${s}`;
    if (time <= 0) { clearInterval(interval); alert("Waktu habis!"); window.location.href = 'index.html'; }
    time--;
  }, 1000);

  // File Upload Logic
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const imagePreview = document.getElementById('imagePreview');
  const placeholder = document.getElementById('uploadPlaceholder');
  const fileNameDisplay = document.getElementById('fileName');
  let selectedFile = null;

  dropzone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
      selectedFile = e.target.files[0];
      fileNameDisplay.textContent = selectedFile.name;
      
      // Preview
      const reader = new FileReader();
      reader.onload = (e) => {
        imagePreview.src = e.target.result;
        imagePreview.classList.remove('hidden');
        placeholder.classList.add('hidden');
      };
      reader.readAsDataURL(selectedFile);
    }
  });

  // Submit Logic - kirim ke server sebagai booking baru
  document.getElementById('btnSubmitPayment').addEventListener('click', async () => {
    const errorAlert = document.getElementById('uploadError');
    if (!selectedFile) {
      errorAlert.classList.remove('hidden');
      return;
    }
    errorAlert.classList.add('hidden');
    
    // UI Loading state
    document.getElementById('btnSubmitPayment').disabled = true;
    document.getElementById('loadingOverlay').classList.remove('hidden');

    try {
      const API_BASE = 'http://localhost:5000/api';

      const form = new FormData();
      form.append('venue_name', draft.venue_name || draft.venueName || '');
      form.append('team_name', draft.team_name || draft.teamName || draft.team || 'Team');
      form.append('booking_date', draft.date || draft.bookingDate || '');
      form.append('start_time', draft.startTime || draft.start_time || '');
      form.append('end_time', draft.endTime || draft.end_time || '');
      form.append('total_price', draft.amountToPayNow || draft.totalPrice || 0);
      form.append('payment_method', draft.paymentMethod || draft.payment_method || '');
      form.append('payment_proof', selectedFile);

      const resp = await fetch(`${API_BASE}/booking`, { method: 'POST', credentials: 'include', body: form });
      const result = await resp.json().catch(() => ({}));
      const bookingId = result.bookingId || (result.data && result.data.id) || Date.now();

      AppStorage.clearDraft();

      window.location.href = `booking-success.html?id=${bookingId}`;
    } catch (err) {
      console.warn('Booking request unavailable, continuing in demo mode:', err);
      AppStorage.clearDraft();
      window.location.href = 'booking-success.html';
    }
  });
});