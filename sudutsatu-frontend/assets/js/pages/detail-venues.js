document.addEventListener('DOMContentLoaded', () => {
  const slots = document.querySelectorAll('.slot.available');
  const selectedSlotsContainer = document.getElementById('selectedSlotsContainer');
  const emptySlotMsg = document.getElementById('emptySlotMsg');
  
  const subtotalEl = document.getElementById('subtotal');
  const dpAmountEl = document.getElementById('dpAmount');
  const totalToPayEl = document.getElementById('totalToPay');
  const paymentStatusLabel = document.getElementById('paymentStatusLabel');
  
  const radioLabels = document.querySelectorAll('.pay-radio');
  const radios = document.querySelectorAll('input[name="paymentType"]');
  const adminFee = 2500;
  
  let selectedSlotsData = [];

  // 1. Logika Klik Slot Jadwal
  slots.forEach(slot => {
    slot.addEventListener('click', function() {
      this.classList.toggle('selected');
      
      const court = this.getAttribute('data-court');
      const time = this.getAttribute('data-time');
      const price = parseInt(this.getAttribute('data-price'));
      const slotId = `${court}-${time}`;

      if (this.classList.contains('selected')) {
        selectedSlotsData.push({ id: slotId, court, time, price });
      } else {
        selectedSlotsData = selectedSlotsData.filter(s => s.id !== slotId);
      }
      
      updateSummaryUI();
    });
  });

  // 2. Logika Update Ringkasan Kanan
  function updateSummaryUI() {
    selectedSlotsContainer.innerHTML = '';
    let subtotal = 0;

    if (selectedSlotsData.length === 0) {
      emptySlotMsg.style.display = 'block';
    } else {
      emptySlotMsg.style.display = 'none';
      
      selectedSlotsData.forEach(slot => {
        subtotal += slot.price;
        const item = document.createElement('div');
        item.className = 'selected-slot-item';
        item.innerHTML = `
          <div class="text-small">
            <div class="text-muted">${slot.court}</div>
            <div class="text-white mt-4">${slot.time}</div>
          </div>
          <div class="text-primary text-small">Rp ${slot.price.toLocaleString('id-ID')}</div>
        `;
        selectedSlotsContainer.appendChild(item);
      });
    }

    subtotalEl.textContent = `Rp ${subtotal.toLocaleString('id-ID')}`;
    calculateTotal(subtotal);
  }

  // 3. Logika Kalkulasi & Metode Pembayaran
  function calculateTotal(subtotal) {
    if (subtotal === 0) {
      totalToPayEl.textContent = 'Rp 0';
      if (dpAmountEl) dpAmountEl.textContent = 'Rp 0';
      return;
    }

    const selectedPayment = document.querySelector('input[name="paymentType"]:checked').value;
    const grandTotal = subtotal + adminFee;

    if (selectedPayment === 'split') {
      const dp = grandTotal / 2;
      if (dpAmountEl) dpAmountEl.textContent = `Rp ${dp.toLocaleString('id-ID')}`;
      totalToPayEl.textContent = `Rp ${dp.toLocaleString('id-ID')}`;
      paymentStatusLabel.textContent = "INITIAL CONTRIBUTION";
    } else {
      totalToPayEl.textContent = `Rp ${grandTotal.toLocaleString('id-ID')}`;
      paymentStatusLabel.textContent = "FULL PAYMENT";
    }
  }

  // 4. Toggle Accordion Radio Button Pembayaran
  radios.forEach(radio => {
    radio.addEventListener('change', () => {
      radioLabels.forEach(lbl => lbl.classList.remove('active-radio'));
      radio.closest('.pay-radio').classList.add('active-radio');
      
      const currentSubtotal = selectedSlotsData.reduce((sum, s) => sum + s.price, 0);
      calculateTotal(currentSubtotal);
    });
  });

  // 5. Logika Tombol Upload Bukti TF
  const btnUploadTF = document.getElementById('btnUploadTF');
  const tfFileInput = document.getElementById('tfFileInput');
  const tfFileName = document.getElementById('tfFileName');

  if (btnUploadTF && tfFileInput) {
    btnUploadTF.addEventListener('click', () => {
      tfFileInput.click();
    });

    tfFileInput.addEventListener('change', function() {
      if (this.files && this.files.length > 0) {
        if (tfFileName) tfFileName.textContent = `File siap: ${this.files[0].name}`;
        btnUploadTF.textContent = "✓ Bukti TF Terpilih";
        btnUploadTF.style.backgroundColor = "rgba(204, 255, 0, 0.1)";
        btnUploadTF.style.border = "1px solid var(--color-primary)";
      } else {
        if (tfFileName) tfFileName.textContent = "";
        btnUploadTF.innerHTML = "&#128196; Upload Bukti TF";
        btnUploadTF.style.backgroundColor = "transparent";
      }
    });
  }

  // 6. Submit Booking
  const btnSubmit = document.getElementById('btnSubmit');
  if (btnSubmit) {
    btnSubmit.addEventListener('click', () => {
      if (selectedSlotsData.length === 0) {
        alert("Pilih minimal 1 jadwal lapangan terlebih dahulu!");
        return;
      }
      
      const teamName = document.getElementById('teamName').value.trim();
      if (!teamName) {
        alert("Masukkan nama tim Anda!");
        return;
      }

      const selectedPayment = document.querySelector('input[name="paymentType"]:checked').value;
      
      // Validasi Wajib Upload File jika memilih Team Cost Sharing
      if (selectedPayment === 'split') {
        if (!tfFileInput || !tfFileInput.files || tfFileInput.files.length === 0) {
          alert("Harap upload bukti transfer DP terlebih dahulu sebelum mengunci jadwal!");
          return;
        }
      }

      const currentSubtotal = selectedSlotsData.reduce((sum, s) => sum + s.price, 0);
      const grandTotal = currentSubtotal + adminFee;
      const payNow = selectedPayment === 'split' ? grandTotal / 2 : grandTotal;

      const finalBooking = {
        bookingId: Math.floor(Math.random() * 90000) + 10000, 
        venueName: "Sudutsatu Arena, Sumedang",
        teamName: teamName,
        date: "13 Mei 2026",
        time: selectedSlotsData.map(s => s.time).join(', '), 
        paymentMethod: selectedPayment === 'split' ? 'Team Cost Sharing' : 'Full Payment',
        totalCost: grandTotal,
        amountToPayNow: payNow,
        remainingCost: selectedPayment === 'split' ? grandTotal / 2 : 0,
        status: 'Menunggu Verifikasi Admin'
      };

      AppStorage.saveBooking(finalBooking);
      
      btnSubmit.innerHTML = "MEMPROSES...";
      btnSubmit.style.opacity = "0.7";
      btnSubmit.disabled = true;

      setTimeout(() => {
        window.location.href = 'booking-success.html';
      }, 1000);
    });
  }
});

// 7. Logika Countdown Timer (10 Menit)
  const timerDisplay = document.getElementById('timerDisplay');
  let timeLeft = 600; // 600 detik = 10 menit

  if (timerDisplay) {
    const countdown = setInterval(() => {
      // Kalkulasi menit dan detik
      const minutes = Math.floor(timeLeft / 60);
      let seconds = timeLeft % 60;

      // Tambahkan angka 0 di depan jika detik di bawah 10 (contoh: 9 jadi 09)
      if (seconds < 10) {
        seconds = `0${seconds}`;
      }

      // Format teks menit (09, 08, dst)
      const displayMinutes = minutes < 10 ? `0${minutes}` : minutes;

      // Update tampilan di tombol
      timerDisplay.innerHTML = `&#8986; ${displayMinutes}:${seconds} Menit Tersisa`;

      // Jika waktu habis
      if (timeLeft <= 0) {
        clearInterval(countdown); // Hentikan timer
        alert("Waktu sesi Anda habis! Silakan pilih ulang jadwal.");
        window.location.reload(); // Refresh halaman agar data reset
      }

      timeLeft--; // Kurangi 1 detik setiap putaran
    }, 1000); // Berjalan setiap 1000 milidetik (1 detik)
  }