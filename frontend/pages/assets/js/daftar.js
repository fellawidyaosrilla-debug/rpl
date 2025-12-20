document.addEventListener('DOMContentLoaded', function() {
    
    const API_URL = 'http://localhost:5000/api/auth';

    // --- ELEMENT SELECTORS ---
    const loginTab = document.getElementById('loginTab');
    const registerTab = document.getElementById('registerTab');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    
    const loginPhoneInput = document.getElementById('loginPhone');
    const loginPasswordInput = document.getElementById('loginPassword');
    
    const regNameInput = document.getElementById('regName');
    const regPhoneInput = document.getElementById('regPhone');
    const regPasswordInput = document.getElementById('regPassword');
    const agreeCheckbox = document.getElementById('agreeSimple');

    // --- TAB SWITCHING ---
    function switchToLogin() {
        loginTab.classList.add('active');
        registerTab.classList.remove('active');
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
    }

    function switchToRegister() {
        registerTab.classList.add('active');
        loginTab.classList.remove('active');
        registerForm.classList.add('active');
        loginForm.classList.remove('active');
    }

    loginTab.addEventListener('click', switchToLogin);
    registerTab.addEventListener('click', switchToRegister);

    // Switch tab based on URL hash (e.g., #login or #register)
    const startHash = window.location.hash;
    if (startHash === '#register') {
        switchToRegister();
    } else if (startHash === '#login') {
        switchToLogin();
    }

    // ==========================================
    // 1. LOGIKA REGISTER (DAFTAR)
    // ==========================================
    registerForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const nama_lengkap = regNameInput.value.trim();
        const no_hp = regPhoneInput.value.trim();
        const password = regPasswordInput.value.trim();

        if (!agreeCheckbox.checked) {
            Swal.fire({
                icon: 'warning',
                title: 'Perhatian',
                text: 'Anda harus menyetujui Syarat & Ketentuan!'
            });
            return;
        }

        try {
            // Loading Button
            const btn = registerForm.querySelector('button');
            const btnText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
            btn.disabled = true;

            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: no_hp,
                    nama_lengkap,
                    no_hp,
                    password,
                    alamat: '-' 
                })
            });

            const result = await response.json();
            
            // Reset Button
            btn.innerHTML = btnText;
            btn.disabled = false;

            if (response.ok) {
                // SUKSES DAFTAR
                Swal.fire({
                    icon: 'success',
                    title: 'Pendaftaran Berhasil!',
                    text: 'Silakan login dengan akun baru Anda.',
                    confirmButtonColor: '#3085d6',
                    confirmButtonText: 'Lanjut Login'
                }).then((result) => {
                    if (result.isConfirmed) {
                        switchToLogin();
                        loginPhoneInput.value = no_hp;
                        registerForm.reset();
                    }
                });

            } else {
                // GAGAL DAFTAR
                Swal.fire({
                    icon: 'error',
                    title: 'Gagal Daftar',
                    text: result.message || 'Terjadi kesalahan saat mendaftar.'
                });
            }

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error Koneksi',
                text: 'Tidak dapat menghubungi server. Pastikan backend menyala.'
            });
        }
    });

    // ==========================================
    // 2. LOGIKA LOGIN (MASUK)
    // ==========================================
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();

        const no_hp = loginPhoneInput.value.trim();
        const password = loginPasswordInput.value.trim();

        try {
            const btn = loginForm.querySelector('button');
            const btnText = btn.innerHTML;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Verifikasi...';
            btn.disabled = true;

            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ no_hp, password })
            });

            const result = await response.json();

            btn.innerHTML = btnText;
            btn.disabled = false;

            if (response.ok) {
                // SIMPAN TOKEN
                localStorage.setItem('token_temucepat', result.token);
                localStorage.setItem('user_temucepat', JSON.stringify(result.user));

                // SUKSES LOGIN
                Swal.fire({
                    icon: 'success',
                    title: 'Login Berhasil!',
                    text: `Selamat datang kembali, ${result.user.nama}!`,
                    timer: 1500, // Otomatis tutup dalam 1.5 detik
                    showConfirmButton: false
                }).then(() => {
                    // Redirect sesuai role
                    if (result.user.role === 'ADMIN') {
                        window.location.href = 'admin_dashboard.html';
                    } else {
                        window.location.href = 'beranda.html';
                    }
                });

            } else {
                // GAGAL LOGIN
                Swal.fire({
                    icon: 'error',
                    title: 'Login Gagal',
                    text: result.message || 'Nomor HP atau Password salah.'
                });
            }

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Error Koneksi',
                text: 'Tidak dapat menghubungi server.'
            });
        }
    });
});