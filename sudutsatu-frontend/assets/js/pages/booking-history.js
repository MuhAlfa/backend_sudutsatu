document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const historyCards = document.querySelectorAll('.history-card');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      // 1. Hapus status active dari semua tombol
      tabBtns.forEach(b => b.classList.remove('active'));
      // 2. Tambahkan active ke tombol yang diklik
      e.target.classList.add('active');

      // 3. Ambil nilai filter (all, aktif, selesai, dibatalkan)
      const filterValue = e.target.getAttribute('data-filter');

      // 4. Sembunyikan atau tampilkan kartu sesuai filter
      historyCards.forEach(card => {
        const cardStatus = card.getAttribute('data-status');
        
        if (filterValue === 'all') {
          card.style.display = 'flex'; // Tampilkan semua
        } else if (filterValue === cardStatus) {
          card.style.display = 'flex'; // Tampilkan yang cocok
        } else {
          card.style.display = 'none'; // Sembunyikan yang tidak cocok
        }
      });
    });
  });
});