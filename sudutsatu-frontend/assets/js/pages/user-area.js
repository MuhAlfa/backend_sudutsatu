document.addEventListener('DOMContentLoaded', () => {
  // Simulasi Navigasi Sidebar Aktif
  const path = window.location.pathname;
  document.querySelectorAll('.sidebar-menu a').forEach(link => {
    if (link.href.includes(path)) link.classList.add('active');
  });

  // Logika Khusus Halaman History (Tab Filtering)
  const historyTabs = document.querySelectorAll('.history-tab');
  const historyCards = document.querySelectorAll('.history-card');

  historyTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      historyTabs.forEach(t => t.classList.remove('active'));
      e.target.classList.add('active');
      const filter = e.target.getAttribute('data-filter');
      
      historyCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-status') === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
});