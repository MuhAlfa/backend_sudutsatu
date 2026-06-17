document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 1. FITUR EDIT DETAIL PRIBADI
  // ==========================================
  const editIcons = document.querySelectorAll('.detail-box .edit-icon-green');
  const btnEditSemua = document.getElementById('btnEditSemua');
  const btnSimpanDetail = document.getElementById('btnSimpanDetail');
  const detailBoxes = document.querySelectorAll('.detail-box');

  function activateEditMode(box) {
    box.classList.add('is-editing');
    if (btnSimpanDetail) btnSimpanDetail.classList.remove('hidden');
  }

  editIcons.forEach(icon => {
    icon.addEventListener('click', (e) => {
      const box = e.target.closest('.detail-box');
      activateEditMode(box);
      const input = box.querySelector('.detail-input');
      if (input) input.focus();
    });
  });

  if (btnEditSemua) {
    btnEditSemua.addEventListener('click', (e) => {
      e.preventDefault();
      detailBoxes.forEach(box => activateEditMode(box));
    });
  }

  if (btnSimpanDetail) {
    btnSimpanDetail.addEventListener('click', () => {
      detailBoxes.forEach(box => {
        if (box.classList.contains('is-editing')) {
          const inputVal = box.querySelector('.detail-input').value;
          const spanText = box.querySelector('.detail-text');
          if (spanText) spanText.textContent = inputVal; 
          box.classList.remove('is-editing');
        }
      });
      btnSimpanDetail.classList.add('hidden');
      alert('Perubahan profil berhasil disimpan!');
    });
  }

  // ==========================================
  // 2. FITUR GANTI FOTO PROFIL (AVATAR MANAGER)
  // ==========================================
  const btnChangePhoto = document.getElementById('btnChangePhoto');
  const fileInputAvatar = document.getElementById('fileInputAvatar');
  const avatarImage = document.getElementById('avatarImage');
  const navAvatarPreview = document.getElementById('navAvatarPreview');

  if (btnChangePhoto && fileInputAvatar && avatarImage) {
    btnChangePhoto.addEventListener('click', () => {
      fileInputAvatar.click(); 
    });

    fileInputAvatar.addEventListener('change', function(e) {
      const file = e.target.files[0]; 
      if (file) {
        if (!file.type.startsWith('image/')) {
          alert('Harap pilih file gambar!');
          return;
        }
        const reader = new FileReader();
        reader.onload = function(event) {
          avatarImage.src = event.target.result;
          if (navAvatarPreview) navAvatarPreview.src = event.target.result; 
          alert('Foto profil berhasil diperbarui (Pratinjau)!');
        };
        reader.readAsDataURL(file);
      }
    });
  }

  // ==========================================
  // 3. FITUR MODAL EDIT PROFIL PUBLIK (NAMA & LOKASI)
  // ==========================================
  const btnEditPublik = document.getElementById('btnEditPublik');
  const modalPublik = document.getElementById('modalProfilPublik');
  const btnCloseModal = document.getElementById('closeModalPublik');
  const btnSimpanPublik = document.getElementById('btnSimpanPublik');
  
  const displayNamaProfil = document.getElementById('displayNamaProfil');
  const inputNamaPublik = document.getElementById('inputNamaPublik');
  
  const displayLokasiHeader = document.getElementById('displayLokasiHeader');
  const inputLokasiPublik = document.getElementById('inputLokasiPublik');

  if (btnEditPublik && modalPublik) {
    btnEditPublik.addEventListener('click', () => modalPublik.classList.remove('hidden'));
    
    if (btnCloseModal) {
      btnCloseModal.addEventListener('click', () => modalPublik.classList.add('hidden'));
    }
    
    if (btnSimpanPublik) {
      btnSimpanPublik.addEventListener('click', () => {
        // Update Nama
        if (inputNamaPublik && inputNamaPublik.value.trim() !== "") {
          if (displayNamaProfil) displayNamaProfil.textContent = inputNamaPublik.value.toUpperCase();
        }
        // Update Lokasi
        if (inputLokasiPublik && inputLokasiPublik.value.trim() !== "") {
          if (displayLokasiHeader) displayLokasiHeader.textContent = inputLokasiPublik.value;
        }
        
        modalPublik.classList.add('hidden');
        alert('Profil Publik dan Lokasi berhasil diperbarui!');
      });
    }
  }

});