document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // KONFIGURASI UMUM SWEETALERT MINIMALIS
  // ==========================================
  const swalConfig = {
    background: '#141414',
    color: '#ffffff',
    confirmButtonColor: '#ccff00',
    cancelButtonColor: '#333',
    backdrop: `rgba(0,0,0,0.8)`,
    heightAuto: false
  };

  // Ambil data langsung dari Memori Browser (localStorage)
  let messages = JSON.parse(localStorage.getItem('adminMessagesData')) || [];
  
  let currentFilterTab = "semua";
  let currentCategory = "semua";
  let activeMessageId = null;

  const tableBody = document.getElementById('msgTableBody');

  // Fungsi Penyimpan Data
  const saveMessagesToMemory = () => {
    localStorage.setItem('adminMessagesData', JSON.stringify(messages));
    // Panggil fungsi update badge di global.js!
    if (window.updateGlobalMessageBadge) {
      window.updateGlobalMessageBadge();
    }
  };

  // RENDER TABEL
  const renderTable = () => {
    tableBody.innerHTML = '';
    const searchTerm = document.getElementById('searchMessageInput').value.toLowerCase();

    const filteredData = messages.filter(msg => {
      const matchSearch = msg.name.toLowerCase().includes(searchTerm) || msg.content.toLowerCase().includes(searchTerm);
      const matchTab = currentFilterTab === "semua" || msg.status === currentFilterTab;
      const matchCat = currentCategory === "semua" || msg.category === currentCategory;
      return matchSearch && matchTab && matchCat;
    });

    if (filteredData.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; padding: 40px; color:#555;">Tidak ada pesan yang cocok ditemukan.</td></tr>`;
      return;
    }

    filteredData.forEach(msg => {
      const isUnread = msg.status === "unread";
      const statusBadge = isUnread 
        ? `<span class="status-pill status-unread"><div class="status-dot-active"></div> Belum Dibaca</span>`
        : `<span class="status-pill status-read">Sudah Dibaca</span>`;

      const shortContent = msg.content.length > 60 ? msg.content.substring(0, 60) + "..." : msg.content;

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="text-white bold">${msg.name}</td>
        <td><span style="color:#aaa; font-weight:500;">${msg.category}</span></td>
        <td style="max-width: 300px; color: ${isUnread ? '#fff' : '#666'}; font-weight: ${isUnread ? '600' : '400'};">${shortContent}</td>
        <td>${msg.date}</td>
        <td>${statusBadge}</td>
        <td style="text-align: center;">
          <button class="btn-view-msg" data-id="${msg.id}">Lihat</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });

    attachModalListeners();
  };

  // LOGIKA MODAL
  const modal = document.getElementById('modalReadMessage');
  
  const attachModalListeners = () => {
    document.querySelectorAll('.btn-view-msg').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = parseInt(e.target.getAttribute('data-id'));
        const msg = messages.find(m => m.id === id);
        
        if (msg) {
          activeMessageId = id;
          
          // JIKA PESAN BARU DIBUKA, UBAH STATUS DAN SIMPAN KE MEMORI!
          if (msg.status === "unread") {
            msg.status = "read";
            saveMessagesToMemory(); 
          }

          document.getElementById('mdlSender').textContent = msg.name;
          document.getElementById('mdlDate').textContent = `${msg.date} (${msg.category})`;
          document.getElementById('mdlContact').textContent = `${msg.email} / +${msg.phone}`;
          document.getElementById('mdlBody').textContent = msg.content;

          modal.style.display = "flex";
          modal.classList.remove('hidden');
          renderTable(); 
        }
      });
    });
  };

  document.getElementById('btnCloseMdl').addEventListener('click', () => { modal.style.display = "none"; });

  document.getElementById('btnReplyWA').addEventListener('click', () => {
    const msg = messages.find(m => m.id === activeMessageId);
    if(msg) {
      const teksWA = `Halo ${msg.name}, saya Admin SudutSatu ingin menanggapi pesan kakak...`;
      window.open(`https://wa.me/${msg.phone}?text=${encodeURIComponent(teksWA)}`, '_blank');
    }
  });

  // JIKA PESAN DIARSIPKAN / DIHAPUS (DENGAN SWEETALERT UX UPGRADE)
  document.getElementById('btnArchiveMsg').addEventListener('click', () => {
    
    Swal.fire({
      ...swalConfig,
      icon: 'question',
      title: 'Arsipkan Pesan?',
      text: 'Pesan ini akan ditandai selesai dan dihapus dari daftar.',
      showCancelButton: true,
      confirmButtonText: '<span style="color: #000; font-weight: bold;">Ya, Arsipkan</span>',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        
        // Eksekusi Hapus & Simpan
        messages = messages.filter(m => m.id !== activeMessageId); 
        saveMessagesToMemory(); 
        
        modal.style.display = "none";
        renderTable();
        
        // Animasi Sukses
        Swal.fire({
          ...swalConfig,
          icon: 'success',
          title: 'Diarsipkan!',
          text: 'Pesan telah diselesaikan.',
          timer: 3000,
          showConfirmButton: false
        });
      }
    });
  });

  // FILTER INTERAKSI
  document.querySelectorAll('.msg-tab-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.msg-tab-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentFilterTab = this.getAttribute('data-filter');
      renderTable();
    });
  });

  document.getElementById('filterKategori').addEventListener('change', (e) => {
    currentCategory = e.target.value;
    renderTable();
  });

  document.getElementById('searchMessageInput').addEventListener('input', renderTable);

  renderTable();

});