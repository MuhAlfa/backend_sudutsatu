document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. FITUR FILTER WAKTU (Tanpa Alert)
    // ==========================================
    const filterWaktu = document.getElementById('filterWaktuDashboard');
    const angkaPendapatan = document.getElementById('angkaPendapatan');
    const trendPendapatan = document.getElementById('trendPendapatan');
    const angkaPemesanan = document.getElementById('angkaPemesanan');
    const trendPemesanan = document.getElementById('trendPemesanan');
    
    if (filterWaktu) {
        filterWaktu.addEventListener('change', (e) => {
            const val = e.target.value;
            
            // Efek visual redup sebentar
            angkaPendapatan.style.opacity = '0.5';
            angkaPemesanan.style.opacity = '0.5';
            trendPendapatan.style.opacity = '0.5';
            trendPemesanan.style.opacity = '0.5';

            setTimeout(() => {
                if(val === 'hari_ini') {
                    angkaPendapatan.textContent = 'Rp 1.250.000';
                    trendPendapatan.textContent = '+5% vs hari lalu';
                    angkaPemesanan.textContent = '18';
                    trendPemesanan.textContent = '+2 vs hari lalu';
                } else if(val === 'minggu_ini') {
                    angkaPendapatan.textContent = 'Rp 8.000.000';
                    trendPendapatan.textContent = '+12.5% vs minggu lalu';
                    angkaPemesanan.textContent = '124';
                    trendPemesanan.textContent = '+8 vs minggu lalu';
                } else if(val === 'bulan_ini') {
                    angkaPendapatan.textContent = 'Rp 34.500.000';
                    trendPendapatan.textContent = '+18% vs bulan lalu';
                    angkaPemesanan.textContent = '512';
                    trendPemesanan.textContent = '+45 vs bulan lalu';
                }

                // Kembalikan visual seperti semula
                angkaPendapatan.style.opacity = '1';
                angkaPemesanan.style.opacity = '1';
                trendPendapatan.style.opacity = '1';
                trendPemesanan.style.opacity = '1';
            }, 300); // Simulasi delay ngambil data 300ms
        });
    }

    // ==========================================
    // 2. FITUR "LIHAT SEMUA" AKTIVITAS TERBARU
    // ==========================================
    const btnLihatSemua = document.getElementById('btnLihatSemuaAktivitas');
    const activityList = document.getElementById('activityListContainer');
    
    if (btnLihatSemua && activityList) {
        btnLihatSemua.addEventListener('click', (e) => {
            e.preventDefault();
            btnLihatSemua.textContent = "Memuat...";
            btnLihatSemua.style.opacity = "0.5";

            setTimeout(() => {
                const ekstraHTML = `
                    <div class="activity-item">
                        <div class="icon-wrapper icon-success">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                        </div>
                        <div class="activity-text">
                            <p class="m-0 text-white text-small line-height-normal">Pembayaran diverifikasi untuk Pemesanan #1021</p>
                            <span class="text-tiny text-muted mt-4 d-block">3 jam lalu</span>
                        </div>
                    </div>
                    <div class="activity-item">
                        <div class="icon-wrapper icon-neutral">
                            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="10"></circle><path d="M12 12l3.5-2m-3.5 2l-3.5-2m3.5 2v4m7.5-6a5 5 0 00-7.5 0m-4 0a5 5 0 00-7.5 0"></path></svg>
                        </div>
                        <div class="activity-text">
                            <p class="m-0 text-white text-small line-height-normal">Andi M. memesan <span class="text-primary bold">Biliard Meja 2</span></p>
                            <span class="text-tiny text-muted mt-4 d-block">5 jam lalu</span>
                        </div>
                    </div>
                `;
                
                // Menambahkan data baru di akhir list
                activityList.insertAdjacentHTML('beforeend', ekstraHTML);
                
                // Sembunyikan tombol setelah ditekan
                btnLihatSemua.style.display = 'none';
            }, 600); 
        });
    }
});