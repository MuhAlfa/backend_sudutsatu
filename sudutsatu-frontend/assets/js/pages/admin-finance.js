document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. DATA TRANSAKSI
  // ==========================================
  let transactionsData = [
    { date: "Mei 24, 2026", id: "#BK-8829", team: "Sumedang FC", amount: "Rp 250.000", status: "LUNAS" },
    { date: "Mei 24, 2026", id: "#BK-8830", team: "Garuda FC", amount: "Rp 150.000", status: "TERTUNDA" },
    { date: "Mei 23, 2026", id: "#BK-8825", team: "Sumedang All Stars", amount: "Rp 350.000", status: "LUNAS" },
    { date: "Mei 23, 2026", id: "#BK-8826", team: "Corporate League", amount: "Rp 500.000", status: "LUNAS" }
  ];

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
    // Binary Search untuk mencari titik di kurva SVG
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

    // C. Kalkulasi / Interpolasi Tanggal dan Nilai (Misal: 19/05/2026)
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

    // Kalkulasi Pendapatan
    let currentVal = p1.val + t * (p2.val - p1.val);
    
    // Kalkulasi Tanggal (Hari demi hari)
    let d1 = new Date(p1.date).getTime();
    let d2 = new Date(p2.date).getTime();
    let currTime = d1 + t * (d2 - d1);
    let currDate = new Date(currTime);

    let dd = String(currDate.getDate()).padStart(2, '0');
    let mm = String(currDate.getMonth() + 1).padStart(2, '0');
    let yy = currDate.getFullYear();

    // Tampilkan di Tooltip
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
  // 4. DRAG TO SCROLL (Bisa ditarik ke samping)
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

    document.querySelectorAll('.btn-batalkan').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const index = transactionsData.findIndex(t => t.id === id);
        if(index > -1) {
          transactionsData[index].status = 'DIBATALKAN';
          alert(`Transaksi ${id} telah dibatalkan.`);
          renderTable(transactionsData); 
        }
      });
    });

    document.querySelectorAll('.btn-unduh-pdf').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = e.target.getAttribute('data-id');
        const originalText = e.target.textContent;
        e.target.textContent = "Menyiapkan...";
        setTimeout(() => {
          e.target.textContent = originalText;
          alert(`File Invoice_${id}.pdf berhasil diunduh!`);
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
  document.getElementById('btnCetakInvoice').addEventListener('click', () => {
    alert('Membuka dialog print...');
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

  // INITIAL RENDER
  renderChart('6'); 
  renderTable(transactionsData);

});