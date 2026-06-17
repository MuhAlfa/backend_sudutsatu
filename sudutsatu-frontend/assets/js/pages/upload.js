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

  // Submit Logic
  document.getElementById('btnSubmitPayment').addEventListener('click', () => {
    const errorAlert = document.getElementById('uploadError');
    if (!selectedFile) {
      errorAlert.classList.remove('hidden');
      return;
    }
    errorAlert.classList.add('hidden');
    
    // UI Loading state
    document.getElementById('btnSubmitPayment').disabled = true;
    document.getElementById('loadingOverlay').classList.remove('hidden');

    // Simulate API Upload (1.5s)
    setTimeout(() => {
      // Create Final Booking Object
      const finalBooking = {
        bookingId: `SS-${Math.floor(Math.random() * 90000) + 10000}`,
        ...draft,
        status: draft.paymentMethod === 'Full Payment' ? 'Booked (Menunggu Verifikasi)' : 'Booked (Team Cost Sharing - Menunggu Verifikasi)',
        timestamp: new Date().toISOString()
      };

      AppStorage.saveBooking(finalBooking);
      AppStorage.clearDraft(); // Clean up session
      window.location.href = 'booking-success.html';
    }, 1500);
  });
});