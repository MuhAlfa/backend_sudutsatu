document.addEventListener('DOMContentLoaded', () => {

  // 1. FITUR SEARCH FILTER REAL-TIME
  const searchInput = document.getElementById('searchInput');
  const tableRows = document.querySelectorAll('.table-row');

  if (searchInput) {
    searchInput.addEventListener('keyup', function() {
      const filterValue = this.value.toLowerCase();
      tableRows.forEach(row => {
        const idBooking = row.querySelector('td:nth-child(1)').textContent.toLowerCase();
        const namaTim = row.querySelector('.team-name-cell').textContent.toLowerCase();
        if (idBooking.includes(filterValue) || namaTim.includes(filterValue)) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    });
  }

  // 2. LOGIKA KEDUA MODAL (Preview & Konfirmasi Lengkap)
  const modalBukti = document.getElementById('modalBukti');
  const modalKonfirmasi = document.getElementById('modalKonfirmasi');
  const previewImage = document.getElementById('previewImage');
  const btnBukaKonfirmasi = document.getElementById('btnBukaKonfirmasi');
  
  // Tombol Tutup (X)
  const closeModal = document.getElementById('closeModal');
  const closeKonfirmasi = document.getElementById('closeKonfirmasi');

  // Variabel untuk menyimpan data baris yang diklik sementara
  let activeRowData = {};

  // A. Saat gambar Bukti di Tabel diklik
  const thumbs = document.querySelectorAll('.bukti-thumb');
  thumbs.forEach(thumb => {
    thumb.addEventListener('click', (e) => {
      // Tangkap baris (tr) tempat gambar ini berada
      const tr = e.target.closest('tr');
      
      // Simpan data dari kolom-kolom tabel tersebut
      activeRowData = {
        id: tr.querySelector('td:nth-child(1)').textContent.trim(),
        tim: tr.querySelector('.team-name-cell').textContent.trim(),
        lokasi: tr.querySelector('td:nth-child(3)').textContent.trim(),
        jam: tr.querySelector('td:nth-child(4)').textContent.trim(),
        nominal: tr.querySelector('td:nth-child(5)').textContent.trim(),
        imgSrc: e.target.getAttribute('src')
      };

      // Tampilkan Modal Preview (Simple)
      previewImage.setAttribute('src', activeRowData.imgSrc);
      modalBukti.classList.remove('hidden');
    });
  });

  // B. Saat tombol "Verifikasi" di Modal Pertama diklik
  if(btnBukaKonfirmasi) {
    btnBukaKonfirmasi.addEventListener('click', () => {
      // 1. Sembunyikan Modal Pertama
      modalBukti.classList.add('hidden');
      
      // 2. Isi data ke Modal Konfirmasi Detail Lengkap
      document.getElementById('konfId').textContent = activeRowData.id;
      document.getElementById('konfNominal').textContent = activeRowData.nominal;
      document.getElementById('konfTim').textContent = activeRowData.tim;
      document.getElementById('konfLokasi').textContent = activeRowData.lokasi;
      
      // (Untuk tanggal kita asumsikan default mockup)
      document.getElementById('konfWaktu').textContent = `${activeRowData.jam} | 20 Mei 2026`;
      document.getElementById('konfImg').setAttribute('src', activeRowData.imgSrc);

      // =========================================================
      // PERBAIKAN: Menghapus ekstensi ganda (.JPG.JPG)
      // =========================================================
      let rawFilename = activeRowData.imgSrc.split('/').pop().split('?')[0] || 'RECEIPT';
      
      // Memotong string berdasarkan titik, lalu mengambil bagian pertamanya saja
      // Contoh: "STRUK3.jpg" akan menjadi "STRUK3"
      let cleanFilename = rawFilename.split('.')[0]; 
      
      // Lalu gabungkan dengan PAYMENT_ dan akhiran .JPG secara manual
      document.getElementById('konfFilename').textContent = 'PAYMENT_' + cleanFilename.toUpperCase() + '.JPG';

      // 3. Tampilkan Modal Kedua (Lengkap)
      modalKonfirmasi.classList.remove('hidden');
    });
  }

  // C. Menutup Modal (Klik tanda X)
  if(closeModal) closeModal.addEventListener('click', () => modalBukti.classList.add('hidden'));
  if(closeKonfirmasi) closeKonfirmasi.addEventListener('click', () => modalKonfirmasi.classList.add('hidden'));

  // D. Aksi Setujui dan Tolak (Simulasi)
  const btnSetujui = document.getElementById('btnSetujui');
  const btnTolak = document.getElementById('btnTolak');

  if(btnSetujui) {
    btnSetujui.addEventListener('click', () => {
      alert(`Pembayaran untuk ${activeRowData.id} berhasil DISETUJUI.`);
      modalKonfirmasi.classList.add('hidden');
    });
  }

  if(btnTolak) {
    btnTolak.addEventListener('click', () => {
      alert(`Pembayaran untuk ${activeRowData.id} DITOLAK.`);
      modalKonfirmasi.classList.add('hidden');
    });
  }

});