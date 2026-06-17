// assets/js/dummy-data.js

const initializeDummyData = () => {
  // Inisialisasi Data Users jika belum ada
  if (!localStorage.getItem('sudutsatu_users')) {
    const dummyUsers = [
      {
        id: 1,
        name: 'Admin SudutSatu',
        email: 'admin@sudutsatu.com',
        password: 'password123', // Dalam real case, password harus di-hash
        phone: '081200000000',
        role: 'admin'
      },
      {
        id: 2,
        name: 'Rizky Pratama',
        email: 'rizky@example.com',
        password: 'password123',
        phone: '081234567890',
        role: 'user'
      }
    ];
    localStorage.setItem('sudutsatu_users', JSON.stringify(dummyUsers));
  }

  // Inisialisasi Data Lapangan (Venues)
  if (!localStorage.getItem('sudutsatu_venues')) {
    const dummyVenues = [
      {
        id: 1,
        name: 'Lapangan 1 (Vinyl)',
        location: 'Sumedang Utara',
        type: 'Futsal',
        price: 200000,
        rating: 4.8,
        reviews: 124,
        image: 'assets/images/venue-1.jpg' // Placeholder path
      },
      {
        id: 2,
        name: 'Meja Billiard 04',
        location: 'SudutSatu Lounge',
        type: 'Billiard',
        price: 80000,
        rating: 4.5,
        reviews: 89,
        image: 'assets/images/venue-2.jpg' // Placeholder path
      }
    ];
    localStorage.setItem('sudutsatu_venues', JSON.stringify(dummyVenues));
  }
};

// Panggil fungsi inisialisasi saat script dimuat
initializeDummyData();
// Tambahkan di dalam fungsi initialize atau di file dummy-data.js Anda
const mockupData = {
  userStats: { totalBookings: 24, activeSessions: 3, points: 1250 },
  activities: [
    { type: 'payment', title: 'Pembayaran Berhasil', desc: 'Booking #SS-89210. Billiard', time: '2 JAM YANG LALU' },
    { type: 'achievement', title: 'Pencapaian Baru: "Hattrick Week"', desc: 'Anda menyelesaikan 3 sesi dalam seminggu', time: 'KEMARIN, 18:30' }
  ],
  adminStats: { revenue: '14.5M', bookings: 124, users: 89, occupancy: '82%' },
  pendingVerifications: [
    { id: '#BK-SMD-8821', team: 'Tampomas FC', venue: 'Lapangan Vinyl', time: '19:00 - 21:00', amount: 150000, img: 'bukti1.jpg' },
    { id: '#BK-SMD-8822', team: 'Jatinangor United', venue: 'Lapangan Vinyl', time: '20:00 - 22:00', amount: 225000, img: 'bukti2.jpg' },
    { id: '#BK-SMD-8825', team: 'Cimalaka Boys', venue: 'Lapangan Sintetis', time: '15:00 - 17:00', amount: 100000, img: 'bukti3.jpg' }
  ]
};