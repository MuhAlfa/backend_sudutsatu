document.addEventListener('DOMContentLoaded', () => {
  // Ambil data booking terakhir dari LocalStorage
  const latestBooking = AppStorage.getLatestBooking();
  
  if (!latestBooking) {
    // Jika tidak ada data booking, biarkan tampilan default (dummy di HTML)
    return;
  }

  // Masukkan data ke dalam halaman HTML
  // Pastikan format ID memiliki "SS-" di depannya
  const formattedId = latestBooking.bookingId.includes('SS-') ? latestBooking.bookingId : `SS-${latestBooking.bookingId}`;
  
  document.getElementById('bId').textContent = formattedId;
  document.getElementById('bVenue').textContent = latestBooking.venueName;
  document.getElementById('bDate').textContent = latestBooking.date; 
  document.getElementById('bTime').textContent = `${latestBooking.time} WIB`;
  
  // Tampilkan harga yang sudah dibayarkan (Dp atau Full)
  document.getElementById('bPaid').textContent = `Rp ${latestBooking.amountToPayNow.toLocaleString('id-ID')}`;
});