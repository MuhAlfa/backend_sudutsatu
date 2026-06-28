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

  const API_BASE = 'http://localhost:5000/api';
  // Cookie-based auth: use credentials: 'include' on fetch calls

  // DATA TRANSAKSI: akan diisi dari server (booking dengan status confirmed)
  let transactionsData = [];

  // ==========================================
  // 2. DATA CHART DINAMIS (Nilai Real untuk Interpolasi)
  // ==========================================
  const chartDatasets = {
    '6': {
      width: 800,
      labels: ['Mei', 'Jun', 'Jul', 'Agt', 'Sep', 'Okt'],
      points: [
        {x: 0,   y: 200, date: '2026-05-01', val: 10.0},
        {x: 160, y: 150, date: '2026-06-01', val: 12.0},
        {x: 320, y: 170, date: '2026-07-01', val: 11.2},
        {x: 480, y: 120, date: '2026-08-01', val: 14.5},
        {x: 640, y: 90,  date: '2026-09-01', val: 15.8},
        {x: 800, y: 40,  date: '2026-10-01', val: 18.2}
      ]
    },
    '12': {
      width: 1100, 
      labels: ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agt','Sep','Okt','Nov','Des'],
      points: [
        {x: 0,    y: 220, date: '2026-01-01', val: 8.0},
        {x: 100,  y: 210, date: '2026-02-01', val: 9.5},
        {x: 200,  y: 190, date: '2026-03-01', val: 10.2},
        {x: 300,  y: 200, date: '2026-04-01', val: 9.8},
        {x: 400,  y: 160, date: '2026-05-01', val: 12.0},
        {x: 500,  y: 140, date: '2026-06-01', val: 13.5},
        {x: 600,  y: 150, date: '2026-07-01', val: 12.8},
        {x: 700,  y: 120, date: '2026-08-01', val: 14.5},
        {x: 800,  y: 100, date: '2026-09-01', val: 15.1},
        {x: 900,  y: 70,  date: '2026-10-01', val: 17.5},
        {x: 1000, y: 50,  date: '2026-11-01', val: 19.0},
        {x: 1100, y: 20,  date: '2026-12-01', val: 21.3}
      ]
    },
    'ytd': {
      width: 600,
      labels: ['Jan','Feb','Mar','Apr','Mei','Jun'],
      points: [
        {x: 0,   y: 220, date: '2026-01-01', val: 8.0},
        {x: 120, y: 190, date: '2026-02-01', val: 9.2},
        {x: 240, y: 200, date: '2026-03-01', val: 8.5},
        {x: 360, y: 150, date: '2026-04-01', val: 11.8},
        {x: 480, y: 110, date: '2026-05-01', val: 14.1},
        {x: 600, y: 60,  date: '2026-06-01', val: 16.5}
      ]
    }
  };

  let activeDataset = chartDatasets['6'];

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
      path += ` L ${points[points.length - 1].x} 240 L ${points[0].x} 240 Z`;
    }
    return path;
  };

  // ==========================================
  // 3. RENDER GRAFIK & TITIK UNGU (SCRUBBER)
  // ==========================================
  const chartInner = document.getElementById('chartInner');
  const chartSvgElement = document.getElementById('chartSvgElement');
  const chartPathFill = document.getElementById('chartPathFill');
  const chartPathLine = document.getElementById('chartPathLine');
  const chartPointsGroup = document.getElementById('chartPointsGroup');
  const chartXAxis = document.getElementById('chartXAxis');
  const crosshair = document.getElementById('chartCrosshair');
  const tooltip = document.getElementById('chartTooltip');

  const renderChart = (datasetKey) => {
    activeDataset = chartDatasets[datasetKey];
    
    chartInner.style.width = activeDataset.width + 'px';
    chartSvgElement.setAttribute('viewBox', `0 0 ${activeDataset.width} 240`);
    
    chartPathFill.setAttribute('d', generateCurvePath(activeDataset.points, true));
    chartPathLine.setAttribute('d', generateCurvePath(activeDataset.points, false));

    chartPointsGroup.innerHTML = '';
    
    // Titik statis pembatas bulan
    activeDataset.points.forEach(pt => {
      const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
      circle.setAttribute('cx', pt.x);
      circle.setAttribute('cy', pt.y);
      circle.setAttribute('r', '3');
      circle.setAttribute('fill', '#111');
      circle.setAttribute('stroke', 'var(--color-primary)');
      circle.setAttribute('stroke-width', '2');
      chartPointsGroup.appendChild(circle);
    });

    // TITIK UNGU YANG BISA BERGERAK (HOVER DOT)
    chartPointsGroup.innerHTML += `<circle id="hoverDot" r="6" fill="#a855f7" stroke="#fff" stroke-width="2" style="opacity:0; pointer-events:none; transition: opacity 0.2s;" />`;

    chartXAxis.innerHTML = '';
    chartXAxis.style.display = 'block'; 
    
    activeDataset.labels.forEach((label, idx) => {
      const span = document.createElement('span');
      span.textContent = label;
      span.style.position = 'absolute';
      span.style.left = activeDataset.points[idx].x + 'px';
      
      if(idx === 0) span.style.transform = 'translateX(0)';
      else if(idx === activeDataset.labels.length - 1) span.style.transform = 'translateX(-100%)';
      else span.style.transform = 'translateX(-50%)';
      
      chartXAxis.appendChild(span);
    });
  };

  // FILTER DROPDOWN BERFUNGSI
  const filterGrafik = document.getElementById('filterWaktuGrafik');
  if (filterGrafik) {
    filterGrafik.addEventListener('change', (e) => {
      renderChart(e.target.value);
    });
  }

  // ALGORITMA SCRUBBER (Titik ungu bergerak & Interpolasi Tanggal)
  chartInner.addEventListener('mousemove', (e) => {
    const rect = chartInner.getBoundingClientRect();
    let mouseX = e.clientX - rect.left; 
    
    if (mouseX < 0) mouseX = 0;
    if (mouseX > activeDataset.width) mouseX = activeDataset.width;

    // A. Cari Posisi Y yang TEPAT di atas garis melengkung
    const pathEl = document.getElementById('chartPathLine');
    const pathLen = pathEl.getTotalLength();
    let minL = 0; let maxL = pathLen;
    for(let i=0; i < 15; i++) {
      let mid = (minL + maxL) / 2;
      let pt = pathEl.getPointAtLength(mid);
      if(pt.x < mouseX) minL = mid;
      else maxL = mid;
    }
    const exactPt = pathEl.getPointAtLength((minL + maxL) / 2);

    // B. Pindahkan Crosshair dan Titik Ungu
    crosshair.style.left = mouseX + 'px';
    crosshair.style.opacity = '1';
    
    const hoverDot = document.getElementById('hoverDot');
    if (hoverDot) {
       hoverDot.setAttribute('cx', mouseX);
       hoverDot.setAttribute('cy', exactPt.y);
       hoverDot.style.opacity = '1';
    }

    // C. Kalkulasi / Interpolasi Tanggal dan Nilai
    let p1 = activeDataset.points[0];
    let p2 = activeDataset.points[activeDataset.points.length-1];
    
    for(let i=0; i < activeDataset.points.length - 1; i++) {
      if(mouseX >= activeDataset.points[i].x && mouseX <= activeDataset.points[i+1].x) {
         p1 = activeDataset.points[i];
         p2 = activeDataset.points[i+1];
         break;
      }
    }

    let t = (mouseX - p1.x) / (p2.x - p1.x);
    if(isNaN(t)) t = 0;

    let currentVal = p1.val + t * (p2.val - p1.val);
    let d1 = new Date(p1.date).getTime();
    let d2 = new Date(p2.date).getTime();
    let currTime = d1 + t * (d2 - d1);
    let currDate = new Date(currTime);

    let dd = String(currDate.getDate()).padStart(2, '0');
    let mm = String(currDate.getMonth() + 1).padStart(2, '0');
    let yy = currDate.getFullYear();

    tooltip.innerHTML = `<span class="tt-date" style="color:#aaa;">${dd}/${mm}/${yy}</span><p class="tt-val" style="color:#fff;">Rp ${currentVal.toFixed(1)}M</p>`;
    tooltip.style.left = e.clientX + 'px';
    tooltip.style.top = (e.clientY - 60) + 'px'; 
    tooltip.classList.add('show');
  });

  chartInner.addEventListener('mouseleave', () => {
    crosshair.style.opacity = '0';
    tooltip.classList.remove('show');
    const hoverDot = document.getElementById('hoverDot');
    if(hoverDot) hoverDot.style.opacity = '0';
  });

  // ==========================================
  // 4. DRAG TO SCROLL
  // ==========================================
  const slider = document.getElementById('chartScrollContainer');
  let isDown = false;
  let startX;
  let scrollLeft;

  if (slider) {
    slider.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - slider.offsetLeft;
      scrollLeft = slider.scrollLeft;
    });
    slider.addEventListener('mouseleave', () => { isDown = false; });
    slider.addEventListener('mouseup', () => { isDown = false; });
    slider.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - slider.offsetLeft;
      const walk = (x - startX) * 2; 
      slider.scrollLeft = scrollLeft - walk;
    });
    slider.scrollLeft = slider.scrollWidth; 
  }

  // ==========================================
  // 5. TABEL, PENCARIAN, & AKSI TRANSAKSI
  // ==========================================
  const tableBody = document.getElementById('financeTableBody');
  let openDropdownId = null; 

  const renderTable = (data) => {
    tableBody.innerHTML = '';
    if (data.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 30px;">Tidak ada transaksi ditemukan.</td></tr>`;
      return;
    }

    data.forEach(trx => {
      let badgeHtml = '';
      if (trx.status === 'LUNAS') badgeHtml = `<span class="f-badge f-badge-lunas"><div class="f-dot"></div> LUNAS</span>`;
      else if (trx.status === 'TERTUNDA') badgeHtml = `<span class="f-badge f-badge-tertunda"><div class="f-dot"></div> TERTUNDA</span>`;
      else badgeHtml = `<span class="f-badge f-badge-batal"><div class="f-dot"></div> DIBATALKAN</span>`;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${trx.date}</td>
        <td><a class="id-link btn-lihat-invoice" data-id="${trx.id}">${trx.id}</a></td>
        <td class="text-white">${trx.team}</td>
        <td class="bold text-white">${trx.amount}</td>
        <td>${badgeHtml}</td>
        <td>
          <div class="action-wrapper">
            <button class="btn-action-dots" data-target="menu-${trx.id}">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none"><circle cx="12" cy="12" r="1"></circle><circle cx="12" cy="5" r="1"></circle><circle cx="12" cy="19" r="1"></circle></svg>
            </button>
            <div id="menu-${trx.id}" class="action-dropdown-menu">
              <button class="btn-lihat-invoice" data-id="${trx.id}">Lihat Invoice</button>
              <button class="btn-unduh-pdf" data-id="${trx.id}">Unduh PDF</button>
              <button class="text-red btn-batalkan" data-id="${trx.id}">Batalkan</button>
            </div>
          </div>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    attachActionListeners();
  };

  const loadTransactionsFromServer = async () => {
    try {
      const res = await fetch(`${API_BASE}/booking`, { method: 'GET', credentials: 'include' });
      if (!res.ok) throw new Error('Gagal memuat data booking');
      const result = await res.json();
      const bookings = result.data || [];
      // Map bookings yang sudah dikonfirmasi menjadi transactions
      transactionsData = bookings.filter(b => b.status === 'confirmed' || b.status === 'paid').map(b => ({
        date: new Date(b.booking_date).toLocaleDateString('id-ID'),
        id: `#BK-${b.id}`,
        team: b.team_name || b.user_name || 'Tim',
        amount: `Rp ${Number(b.total_price || 0).toLocaleString('id-ID')}`,
        status: 'LUNAS'
      }));
      renderTable(transactionsData);
    } catch (err) {
      console.error('loadTransactionsFromServer', err);
      // fallback ke data statis jika gagal
      renderTable(transactionsData);
    }
  };

  const modalInvoice = document.getElementById('modalInvoice');
  
  const attachActionListeners = () => {
    document.querySelectorAll('.btn-action-dots').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        const targetId = btn.getAttribute('data-target');
        const menu = document.getElementById(targetId);

        if (openDropdownId && openDropdownId !== targetId) {
          const oldMenu = document.getElementById(openDropdownId);
          if(oldMenu) oldMenu.classList.remove('show');
        }

        if (menu.classList.contains('show')) {
          menu.classList.remove('show');
          openDropdownId = null;
        } else {
          menu.classList.add('show');
          openDropdownId = targetId;
        }
      });
    });

    // UX UPGRADE: POP-UP KONFIRMASI BATALKAN TRANSAKSI
    document.querySelectorAll('.btn-batalkan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        
        Swal.fire({
          ...swalConfig,
          icon: 'warning',
          title: 'Batalkan Transaksi?',
          text: `Anda yakin ingin membatalkan transaksi ${id}?`,
          showCancelButton: true,
          confirmButtonColor: '#ff5555',
          confirmButtonText: 'Ya, Batalkan',
          cancelButtonText: 'Kembali'
        }).then((result) => {
          if (result.isConfirmed) {
            const index = transactionsData.findIndex(t => t.id === id);
            if(index > -1) {
              transactionsData[index].status = 'DIBATALKAN';
              renderTable(transactionsData); 
              
              Swal.fire({
                ...swalConfig,
                icon: 'success',
                title: 'Dibatalkan',
                text: `Transaksi ${id} telah dibatalkan.`,
                timer: 2000,
                showConfirmButton: false
              });
            }
          }
        });
      });
    });

    // UX UPGRADE: POP-UP SUKSES UNDUH PDF
    document.querySelectorAll('.btn-unduh-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const originalText = e.target.textContent;
        e.target.textContent = "Menyiapkan...";
        
        setTimeout(() => {
          e.target.textContent = originalText;
          Swal.fire({
            ...swalConfig,
            icon: 'success',
            title: 'Berhasil Diunduh!',
            text: `File Invoice_${id}.pdf telah tersimpan ke perangkat Anda.`,
            timer: 2000,
            showConfirmButton: false
          });
        }, 1000);
      });
    });

    document.querySelectorAll('.btn-lihat-invoice').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const data = transactionsData.find(t => t.id === id);
        if(data) {
          document.getElementById('invId').textContent = data.id;
          document.getElementById('invDate').textContent = data.date;
          document.getElementById('invTeam').textContent = data.team;
          document.getElementById('invAmount').textContent = data.amount;
          
          let badge = '';
          if (data.status === 'LUNAS') badge = `<span class="f-badge f-badge-lunas"><div class="f-dot"></div> LUNAS</span>`;
          else if (data.status === 'TERTUNDA') badge = `<span class="f-badge f-badge-tertunda"><div class="f-dot"></div> TERTUNDA</span>`;
          else badge = `<span class="f-badge f-badge-batal"><div class="f-dot"></div> DIBATALKAN</span>`;
          
          document.getElementById('invStatusBadge').innerHTML = badge;
          modalInvoice.classList.remove('hidden');
        }
      });
    });
  };

  window.addEventListener('click', () => {
    if (openDropdownId) {
      const menu = document.getElementById(openDropdownId);
      if(menu) menu.classList.remove('show');
      openDropdownId = null;
    }
  });

  document.getElementById('closeInvoice').addEventListener('click', () => {
    modalInvoice.classList.add('hidden');
  });

  // UX UPGRADE: MENGAKTIFKAN WINDOW.PRINT NATIVE
  document.getElementById('btnCetakInvoice').addEventListener('click', () => {
    window.print(); // Ini akan memanggil dialog print bawaan komputer (Ctrl+P)
  });

  // ==========================================
  // 6. PENCARIAN & TOMBOL LIHAT SEMUA
  // ==========================================
  const searchInput = document.getElementById('searchTransaksi');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const term = e.target.value.toLowerCase();
      const filtered = transactionsData.filter(trx => 
        trx.id.toLowerCase().includes(term) || 
        trx.team.toLowerCase().includes(term)
      );
      renderTable(filtered);
    });
  }

  const btnLihatSemua = document.getElementById('btnLihatSemua');
  if (btnLihatSemua) {
    btnLihatSemua.addEventListener('click', () => {
      const extraData = [
        { date: "Mei 20, 2026", id: "#BK-8815", team: "Biliar Squad", amount: "Rp 100.000", status: "LUNAS" },
        { date: "Mei 19, 2026", id: "#BK-8812", team: "Tampomas FC", amount: "Rp 150.000", status: "LUNAS" }
      ];
      transactionsData = transactionsData.concat(extraData);
      renderTable(transactionsData);
      btnLihatSemua.style.display = 'none'; 
    });
  }

  // ==========================================
  // 7. FITUR BARU: EKSPOR LAPORAN
  // ==========================================
  const btnEkspor = document.getElementById('btnEkspor') || document.getElementById('btnExportLaporan');
  if (btnEkspor) {
    btnEkspor.addEventListener('click', () => {
      Swal.fire({
        ...swalConfig,
        icon: 'question',
        title: 'Ekspor Laporan',
        text: 'Pilih format laporan yang ingin diunduh:',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonColor: '#ff4b4b', // Warna merah untuk PDF
        denyButtonColor: '#107c41',    // Warna hijau khas Excel
        confirmButtonText: 'Format PDF',
        denyButtonText: 'Format Excel',
        cancelButtonText: 'Batal'
      }).then((result) => {
        if (result.isConfirmed) {
          Swal.fire({
            ...swalConfig, 
            icon: 'success', 
            title: 'Mengekspor PDF...', 
            text: 'Laporan PDF berhasil diunduh.', 
            timer: 2000, 
            showConfirmButton: false
          });
        } else if (result.isDenied) {
          Swal.fire({
            ...swalConfig, 
            icon: 'success', 
            title: 'Mengekspor Excel...', 
            text: 'Laporan Excel berhasil diunduh.', 
            timer: 2000, 
            showConfirmButton: false
          });
        }
      });
    });
  }

  // INITIAL RENDER
  renderChart('6'); 
  renderTable(transactionsData);
  loadTransactionsFromServer();

});