document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // KONFIGURASI UMUM SWEETALERT
    // ==========================================
    const swalConfig = {
      background: '#141414',
      color: '#ffffff',
      confirmButtonColor: '#ccff00',
      cancelButtonColor: '#333',
      backdrop: `rgba(0,0,0,0.8)`,
      heightAuto: false
    };

/// ==========================================
    // 1. DATA GRAFIK INTERAKTIF (PER MINGGU)
    // ==========================================
    const chartDatasets = {
        'futsal': {
            color: '#ccff00', 
            width: 600,
            labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
            points: [
                {x: 0,   y: 190, val: 1.2}, // 1.2M (Posisi Y lebih rendah)
                {x: 200, y: 95,  val: 3.1}, // 3.1M
                {x: 400, y: 120, val: 2.6}, // 2.6M
                {x: 600, y: 10,  val: 4.8}  // 4.8M (Titik Mentok Kanan)
            ]
        },
        'biliard': {
            color: '#a855f7', 
            width: 600,
            labels: ['Minggu 1', 'Minggu 2', 'Minggu 3', 'Minggu 4'],
            points: [
                {x: 0,   y: 155, val: 1.9}, 
                {x: 200, y: 130, val: 2.4}, 
                {x: 400, y: 45,  val: 4.1}, 
                {x: 600, y: 85,  val: 3.3}  
            ]
        }
    };

    let activeData = chartDatasets['futsal'];

    const generateCurvePath = (points, isFill) => {
        if (points.length === 0) return '';
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            const prev = points[i - 1];
            const curr = points[i];
            const cpX = (prev.x + curr.x) / 2; 
            path += ` C ${cpX} ${prev.y}, ${cpX} ${curr.y}, ${curr.x} ${curr.y}`;
        }
        if (isFill) {
            // Tarik shading warna mentok ke bawah kotak (koordinat Y = 200)
            path += ` L ${points[points.length - 1].x} 200 L ${points[0].x} 200 Z`;
        }
        return path;
    };

    // Elemen Grafik
    const chartInner = document.getElementById('chartInner');
    const chartSvgElement = document.getElementById('chartSvgElement');
    const chartPathFill = document.getElementById('chartPathFill');
    const chartPathLine = document.getElementById('chartPathLine');
    const chartPointsGroup = document.getElementById('chartPointsGroup');
    const chartXAxis = document.getElementById('chartXAxis');
    const crosshair = document.getElementById('chartCrosshair');
    const tooltip = document.getElementById('chartTooltip');
    const gradStop1 = document.getElementById('gradStop1');
    const gradStop2 = document.getElementById('gradStop2');

    const renderChart = (type) => {
        activeData = chartDatasets[type];
        
        gradStop1.setAttribute('stop-color', activeData.color);
        gradStop2.setAttribute('stop-color', activeData.color);
        chartPathLine.setAttribute('stroke', activeData.color);

        // Atur rasio persis 1:1
        chartInner.style.width = activeData.width + 'px';
        chartSvgElement.setAttribute('viewBox', `0 0 ${activeData.width} 200`);
        chartPathFill.setAttribute('d', generateCurvePath(activeData.points, true));
        chartPathLine.setAttribute('d', generateCurvePath(activeData.points, false));

        chartPointsGroup.innerHTML = '';
        activeData.points.forEach(pt => {
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute('cx', pt.x);
            circle.setAttribute('cy', pt.y);
            circle.setAttribute('r', '5');
            circle.setAttribute('fill', '#141414');
            circle.setAttribute('stroke', activeData.color);
            circle.setAttribute('stroke-width', '2');
            chartPointsGroup.appendChild(circle);
        });

        chartPointsGroup.innerHTML += `<circle id="hoverDot" r="6" fill="${activeData.color}" stroke="#fff" stroke-width="2" style="opacity:0; pointer-events:none; transition: opacity 0.1s;" />`;

        chartXAxis.innerHTML = '';
        activeData.labels.forEach((label, idx) => {
            const span = document.createElement('span');
            span.textContent = label;
            span.style.position = 'absolute';
            span.style.left = activeData.points[idx].x + 'px';
            if(idx === 0) span.style.transform = 'translateX(0)';
            else if(idx === activeData.labels.length - 1) span.style.transform = 'translateX(-100%)'; // Cegah teks turun
            else span.style.transform = 'translateX(-50%)';
            chartXAxis.appendChild(span);
        });
    };

    // ==========================================
    // 2. LOGIKA SCRUBBER (TITIK 100% PRESISI)
    // ==========================================
    chartInner.addEventListener('mousemove', (e) => {
        const rect = chartInner.getBoundingClientRect();
        let mouseX = e.clientX - rect.left; 

        if (mouseX < 0) mouseX = 0; 
        if (mouseX > activeData.width) mouseX = activeData.width;

        // Pencarian Koordinat Y Presisi Tinggi
        const pathLen = chartPathLine.getTotalLength();
        let minL = 0; let maxL = pathLen;
        for(let i=0; i < 20; i++) {
            let mid = (minL + maxL) / 2;
            let pt = chartPathLine.getPointAtLength(mid);
            if(pt.x < mouseX) minL = mid;
            else maxL = mid;
        }
        const exactPt = chartPathLine.getPointAtLength((minL + maxL) / 2);

        crosshair.style.left = mouseX + 'px';
        crosshair.style.opacity = '1';
        
        const hoverDot = document.getElementById('hoverDot');
        if (hoverDot) {
            hoverDot.setAttribute('cx', exactPt.x);
            hoverDot.setAttribute('cy', exactPt.y); // Y dijamin sejajar sempurna
            hoverDot.style.opacity = '1';
        }

        let p1 = activeData.points[0];
        let p2 = activeData.points[activeData.points.length-1];
        for(let i=0; i < activeData.points.length - 1; i++) {
            if(mouseX >= activeData.points[i].x && mouseX <= activeData.points[i+1].x) {
                p1 = activeData.points[i];
                p2 = activeData.points[i+1];
                break;
            }
        }
        let t = (mouseX - p1.x) / (p2.x - p1.x);
        if(isNaN(t)) t = 0;
        let currentVal = p1.val + t * (p2.val - p1.val);

        tooltip.innerHTML = `<span style="color:#aaa; font-size:11px; margin-bottom:2px;">Pendapatan</span><strong style="color:${activeData.color}; font-size:16px;">Rp ${currentVal.toFixed(2)} M</strong>`;
        tooltip.style.left = mouseX + 'px';
        tooltip.style.top = (exactPt.y) + 'px'; 
        tooltip.style.opacity = '1';
    });

    chartInner.addEventListener('mouseleave', () => {
        crosshair.style.opacity = '0';
        tooltip.style.opacity = '0';
        const hoverDot = document.getElementById('hoverDot');
        if(hoverDot) hoverDot.style.opacity = '0';
    });

    // DRAG TO SCROLL
    const slider = document.getElementById('dashboardChartScroll');
    let isDown = false, startX, scrollLeft;
    if (slider) {
        slider.addEventListener('mousedown', (e) => {
            isDown = true;
            slider.style.cursor = 'grabbing';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });
        slider.addEventListener('mouseleave', () => { isDown = false; slider.style.cursor = 'grab'; });
        slider.addEventListener('mouseup', () => { isDown = false; slider.style.cursor = 'grab'; });
        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; 
            slider.scrollLeft = scrollLeft - walk;
        });
    }

    // ==========================================
    // 3. TOMBOL TOGGLE GRAFIK (FUTSAL / BILIARD)
    // ==========================================
    const btnFutsal = document.getElementById('btnFilterFutsal');
    const btnBiliard = document.getElementById('btnFilterBiliard');

    if (btnFutsal && btnBiliard) {
        btnFutsal.addEventListener('click', () => {
            btnFutsal.style.background = 'rgba(204,255,0,0.1)';
            btnFutsal.style.color = '#ccff00';
            btnFutsal.style.borderColor = '#ccff00';
            btnBiliard.style.background = 'transparent';
            btnBiliard.style.color = '#888';
            btnBiliard.style.borderColor = '#444';
            renderChart('futsal'); 
        });

        btnBiliard.addEventListener('click', () => {
            btnBiliard.style.background = 'rgba(168,85,247,0.1)';
            btnBiliard.style.color = '#a855f7';
            btnBiliard.style.borderColor = '#a855f7';
            btnFutsal.style.background = 'transparent';
            btnFutsal.style.color = '#888';
            btnFutsal.style.borderColor = '#444';
            renderChart('biliard'); 
        });
    }

    // PANGGIL RENDER PERTAMA KALI
    renderChart('futsal');

    // ==========================================
    // 4. FITUR LAINNYA (ANGKA TINJAUAN, EKSPOR, AKTIVITAS)
    // ==========================================
    const filterWaktu = document.getElementById('filterWaktuDashboard');
    const angkaPendapatan = document.getElementById('angkaPendapatan');
    const trendPendapatan = document.getElementById('trendPendapatan');
    const angkaPemesanan = document.getElementById('angkaPemesanan');
    const trendPemesanan = document.getElementById('trendPemesanan');
    
    if (filterWaktu) {
        filterWaktu.addEventListener('change', (e) => {
            const val = e.target.value;
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
                angkaPendapatan.style.opacity = '1';
                angkaPemesanan.style.opacity = '1';
                trendPendapatan.style.opacity = '1';
                trendPemesanan.style.opacity = '1';
            }, 300); 
        });
    }

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
                `;
                activityList.insertAdjacentHTML('beforeend', ekstraHTML);
                btnLihatSemua.style.display = 'none';
            }, 600); 
        });
    }

    const btnEkspor = document.getElementById('btnEkspor');
    if (btnEkspor) {
      btnEkspor.addEventListener('click', () => {
        Swal.fire({
          ...swalConfig,
          icon: 'question',
          title: 'Ekspor Data Operasi',
          text: 'Pilih format laporan yang ingin diunduh:',
          showDenyButton: true,
          showCancelButton: true,
          confirmButtonColor: '#ff4b4b',
          denyButtonColor: '#107c41',
          confirmButtonText: 'PDF',
          denyButtonText: 'Excel',
          cancelButtonText: 'Batal'
        }).then((result) => {
          if (result.isConfirmed) {
            Swal.fire({...swalConfig, icon: 'success', title: 'Berhasil', text: 'Laporan PDF sedang diunduh.', timer: 2000, showConfirmButton: false});
          } else if (result.isDenied) {
            Swal.fire({...swalConfig, icon: 'success', title: 'Berhasil', text: 'Laporan Excel sedang diunduh.', timer: 2000, showConfirmButton: false});
          }
        });
      });
    }

});