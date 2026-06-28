document.addEventListener('DOMContentLoaded', () => {
    const DEFAULT_API_BASE_URLS = [
        'http://localhost:5000/api',
        'http://127.0.0.1:5000/api'
    ];
    const API_BASE_URLS = window.location.hostname === '127.0.0.1'
        ? ['http://127.0.0.1:5000/api', 'http://localhost:5000/api']
        : ['http://localhost:5000/api', 'http://127.0.0.1:5000/api'];
    const loginPage = 'pages/auth/login.html';

    const displayNamaProfil = document.getElementById('displayNamaProfil');
    const txtNamaLengkap = document.getElementById('txtNamaLengkap');
    const inpNamaLengkap = document.getElementById('inpNamaLengkap');
    const txtEmail = document.getElementById('txtEmail');
    const inpEmail = document.getElementById('inpEmail');
    const txtTelepon = document.getElementById('txtTelepon');
    const inpTelepon = document.getElementById('inpTelepon');
    const avatarImage = document.getElementById('avatarImage');
    const fileInputAvatar = document.getElementById('fileInputAvatar');
    const btnChangePhoto = document.getElementById('btnChangePhoto');

    // Decode JWT payload (simple base64url -> JSON) to show login email immediately
    const decodeJwt = (t) => {
        try {
            const parts = t.split('.');
            if (parts.length < 2) return null;
            const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
            const json = atob(payload);
            try { return JSON.parse(decodeURIComponent(escape(json))); } catch(e) { return JSON.parse(json); }
        } catch (e) {
            return null;
        }
    };

    // Do not depend on localStorage token — we'll fetch profile via cookie (credentials)

    const handleUnauthorized = () => {
        setProfileValues({});
    };

    const setProfileValues = ({ name, email, phone }) => {
        const activeName = name || 'Pengguna SudutSatu';
        const activeEmail = email || 'Email belum diatur';
        const activePhone = phone || 'Nomor belum diatur';

        if (displayNamaProfil) displayNamaProfil.textContent = activeName.toUpperCase();
        if (txtNamaLengkap) txtNamaLengkap.textContent = activeName;
        if (inpNamaLengkap) inpNamaLengkap.value = activeName;
        if (txtEmail) txtEmail.textContent = activeEmail;
        if (inpEmail) inpEmail.value = activeEmail;
        if (txtTelepon) txtTelepon.textContent = activePhone;
        if (inpTelepon) inpTelepon.value = activePhone;
    };

    const loadUserProfile = async () => {
        let lastError = null;
        for (const base of API_BASE_URLS) {
            try {
                    console.log('[profile] Trying /auth/me at', base, 'with credentials');
                    const res = await fetch(`${base}/auth/me`, {
                        method: 'GET',
                        mode: 'cors',
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json'
                        }
                    });

                if (!res.ok) {
                    const bodyText = await res.text().catch(() => 'unable to read body');
                    console.warn('[profile] failed for', base, res.status, res.statusText, bodyText);
                    lastError = new Error(`Server ${base} responded ${res.status}`);
                    // Don't redirect immediately on 401; try the next host first.
                    continue;
                }

                const data = await res.json();
                console.log('[profile] /auth/me response from', base, data);
                const user = data.user || {};
                setProfileValues(user);
                return; // success
            } catch (err) {
                console.warn('[profile] network/error for', base, err.message || err);
                lastError = err;
                // try next base
            }
        }

        console.warn('Gagal memuat profil, menggunakan fallback nilai default:', lastError);
        handleUnauthorized();
    };

    loadUserProfile();

    const savedPhoto = localStorage.getItem('sudutsatu_profile_pic');
    if (savedPhoto && avatarImage) {
        avatarImage.src = savedPhoto;
    }

    const openPhotoPicker = () => {
        if (fileInputAvatar) {
            fileInputAvatar.click();
        }
    };

    if (avatarImage) {
        avatarImage.style.cursor = 'pointer';
        avatarImage.title = 'Klik untuk mengganti foto profil';
        avatarImage.addEventListener('click', openPhotoPicker);
    }

    if (btnChangePhoto) {
        btnChangePhoto.addEventListener('click', openPhotoPicker);
    }

    if (fileInputAvatar) {
        fileInputAvatar.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result;
                localStorage.setItem('sudutsatu_profile_pic', base64String);
                if (avatarImage) avatarImage.src = base64String;
                alert('Pembaruan Berhasil: Foto profil Anda telah diganti!');
            };
            reader.readAsDataURL(file);
        });
    }
});