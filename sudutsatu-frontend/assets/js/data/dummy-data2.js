// ========================================================================
// TAMBAHAN DATA KHUSUS UNTUK FITUR BOOKING (DETAIL, CHECKOUT, UPLOAD)
// ========================================================================

const venuesData = [
  {
    id: "V001", // Sesuai dengan id lapangan di data lama Anda
    name: "Lapangan 1 (Vinyl)",
    type: "Futsal",
    location: "Sumedang Utara",
    rating: 4.8,
    reviews: 124,
    basePrice: 200000,
    image: "assets/images/landingpages.jpg",
    description: "Lantai vinyl standar internasional & rumput sintetis premium untuk performa maksimal. Dilengkapi dengan tribun penonton dan pencahayaan LED 800 lux.",
    facilities: ["Parkir Luas", "Kantin / Cafe", "Ruang Ganti AC", "Sewa Sepatu", "Papan Skor Digital"],
    schedules: [
      { id: "S1", date: "2026-05-13", time: "18:00 - 19:00", price: 150000, status: "available" },
      { id: "S2", date: "2026-05-13", time: "19:00 - 20:00", price: 200000, status: "available" },
      { id: "S3", date: "2026-05-13", time: "20:00 - 21:00", price: 200000, status: "booked" }
    ]
  }
];

// Helper untuk menyimpan Draft Booking sementara selama 10 menit
const AppStorage = {
  saveDraft: (data) => localStorage.setItem('bookingDraft', JSON.stringify(data)),
  getDraft: () => JSON.parse(localStorage.getItem('bookingDraft')),
  clearDraft: () => localStorage.removeItem('bookingDraft'),
  saveBooking: (data) => {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(data);
    localStorage.setItem('bookings', JSON.stringify(bookings));
  },
  getLatestBooking: () => {
    let bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    return bookings[bookings.length - 1];
  }
};