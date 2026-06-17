// ==================================================
// DUMMY DATA: VENUES.JS
// ==================================================
// Ini mensimulasikan data lapangan yang akan kita ambil
// dari MySQL/API di masa depan.
// ==================================================

const venuesData = [
  {
    id: 'V001',
    name: 'SudutSatu Futsal Arena - Sumedang',
    type: 'Futsal',
    location: 'Sumedang, Jawa Barat',
    address: 'Jl. Pemuda No. 12, Sumedang',
    rating: 4.8,
    pricePerHour: 150000,
    imageUrl: 'assets/images/futsal-vinyl.png', // Gambar dummy
    facilities: ['Lantai Vinyl', 'Ruang Ganti', 'Parkir Luas']
  },
  {
    id: 'V002',
    name: 'Champion Billiard Zone',
    type: 'Billiard',
    location: 'Sumedang, Jawa Barat',
    address: 'Kawasan Wisata Alun-alun, Sumedang',
    rating: 4.5,
    pricePerHour: 75000,
    imageUrl: 'assets/images/meja1.png', // Gambar dummy
    facilities: ['Meja 9-ft', 'AC Lounge', 'Free Wi-Fi']
  },
  {
    id: 'V003',
    name: 'SudutSatu Sport Center - Sumedang',
    type: 'Futsal',
    location: 'Sumedang, Jawa Barat',
    address: 'Jl. Pemuda NO. 12, Sumedang',
    rating: 4.2,
    pricePerHour: 120000,
    imageUrl: 'assets/images/futsal-sintetis.png', // Gambar dummy
    facilities: ['Rumput Sintetis', 'Kantin', 'Toilet']
  },
    {
    id: 'V004',
    name: 'Breakshot Billiard',
    type: 'Billiard',
    location: 'Sumedang, Jawa Barat',
    address: 'Kawasan Wisata Alun-alun, Sumedang',
    rating: 4.9,
    pricePerHour: 80000,
    imageUrl: 'assets/images/meja2.png', // Gambar dummy
    facilities: ['Meja Turnamen', 'Smoking Area', 'Music']
  }
];

// Nanti di masa depan, kita akan mengekspor ini agar bisa diimpor
// oleh file JavaScript di halaman.
// export default venuesData;