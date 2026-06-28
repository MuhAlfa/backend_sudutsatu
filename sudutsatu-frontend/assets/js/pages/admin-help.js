document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // KONFIGURASI UMUM SWEETALERT MINIMALIS
  // ==========================================
  const swalConfig = {
    background: '#141414',
    color: '#ffffff',
    confirmButtonColor: '#ccff00',
    cancelButtonColor: '#333',
    backdrop: `rgba(0,0,0,0.8)`,
    heightAuto: false
  };

  // ==========================================
  // 1. LOGIKA AKORDEON FAQ (Buka-Tutup Pertanyaan)
  // ==========================================
  const faqQuestions = document.querySelectorAll('.faq-question');

  faqQuestions.forEach(btn => {
    btn.addEventListener('click', function() {
      // Toggle class 'active' pada item induknya
      const faqItem = this.parentElement;
      faqItem.classList.toggle('active');

      // Animasi buka tutup konten
      const answer = this.nextElementSibling;
      if (faqItem.classList.contains('active')) {
        answer.style.maxHeight = answer.scrollHeight + "px";
      } else {
        answer.style.maxHeight = null;
      }
    });
  });

  // ==========================================
  // 2. TOMBOL HUBUNGI WHATSAPP
  // ==========================================
  const btnWhatsapp = document.getElementById('btnWhatsapp');
  if (btnWhatsapp) {
    btnWhatsapp.addEventListener('click', () => {
      // Ganti dengan nomor WhatsApp Developer/IT sesungguhnya (Gunakan kode negara, misal: 6281xxx)
      const noWA = "6281234567890";
      const pesan = "Halo Tim IT SudutSatu, saya admin lapangan ingin melaporkan kendala darurat...";
      const url = `https://wa.me/${noWA}?text=${encodeURIComponent(pesan)}`;
      
      // Buka tab baru menuju WhatsApp
      window.open(url, '_blank');
    });
  }

  // ==========================================
  // 3. SIMULASI FORM LAPOR KENDALA (BUG REPORT)
  // ==========================================
  const formBug = document.getElementById('formBugReport');
  const btnKirim = document.getElementById('btnKirimLaporan');

  if (formBug && btnKirim) {
    formBug.addEventListener('submit', (e) => {
      e.preventDefault(); // Jangan refresh halaman

      // Ubah tombol jadi mode loading
      const textAsal = btnKirim.textContent;
      btnKirim.textContent = "Mengirim...";
      btnKirim.style.opacity = "0.7";
      btnKirim.style.pointerEvents = "none";

      // Simulasi jeda waktu pengiriman (1 detik)
      setTimeout(() => {
        btnKirim.textContent = "Laporan Terkirim ✓";
        btnKirim.style.background = "rgba(204, 255, 0, 0.1)";
        btnKirim.style.color = "var(--color-primary)";
        btnKirim.style.borderColor = "var(--color-primary)";

        // SWEETALERT: PENGGANTI ALERT POLOSAN
        Swal.fire({
          ...swalConfig,
          icon: 'success',
          title: 'Laporan Diterima!',
          text: 'Terima kasih, Tim IT akan segera meninjau kendala Anda.',
          confirmButtonText: '<span style="color: #000; font-weight: bold;">Selesai</span>',
          timer: 5000
        });

        formBug.reset(); // Kosongkan form

        // Kembalikan tombol ke keadaan semula setelah 2.5 detik
        setTimeout(() => {
          btnKirim.textContent = textAsal;
          btnKirim.style.background = "";
          btnKirim.style.color = "";
          btnKirim.style.borderColor = "#333";
          btnKirim.style.opacity = "1";
          btnKirim.style.pointerEvents = "auto";
        }, 2500);

      }, 1000);
    });
  }

});