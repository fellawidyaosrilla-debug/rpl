document.addEventListener('DOMContentLoaded', () => {
    
    // Pastikan URL ini benar
    const API_URL = 'http://localhost:5000/api/auth';
    
    // === LOGIKA REGISTER ===
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Ambil value dan hapus spasi di awal/akhir
            const nama = document.getElementById('regName').value.trim();
            const no_hp = document.getElementById('regPhone').value.trim();
            const password = document.getElementById('regPassword').value.trim();
            const agree = document.getElementById('agree').checked;

            // DEBUGGING: Cek di Console Browser (F12)
            console.log("Mencoba daftar dengan data:", { nama, no_hp, password, agree });

            // 1. Validasi Di Sini (Agar tidak perlu ke server kalau kosong)
            if (!nama || !no_hp || !password) {
                Swal.fire('Gagal', 'Mohon lengkapi Nama, Nomor HP, dan Password.', 'warning');
                return;
            }

            if (!agree) {
                Swal.fire('Gagal', 'Anda harus menyetujui Syarat & Ketentuan.', 'warning');
                return;
            }

            // Tombol Loading
            const btn = regForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Memproses...';
            btn.disabled = true;

            try {
                const response = await fetch(`${API_URL}/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nama, no_hp, password })
                });
                
                const result = await response.json();
                console.log("Respon Server:", result); // Debugging Respon

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Registrasi Berhasil!',
                        text: 'Silakan login dengan akun baru Anda.',
                        confirmButtonColor: '#3b82f6'
                    }).then(() => {
                        switchTab('login');
                        regForm.reset();
                    });
                } else {
                    // Tampilkan pesan error spesifik dari server
                    throw new Error(result.message || 'Gagal Mendaftar (Cek Console)');
                }
            } catch (error) {
                console.error("Error Fetch:", error);
                Swal.fire('Gagal', error.message, 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    // === LOGIKA LOGIN ===
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const no_hp = document.getElementById('loginPhone').value.trim();
            const password = document.getElementById('loginPassword').value.trim();

            if(!no_hp || !password) {
                Swal.fire('Gagal', 'Nomor HP dan Password wajib diisi.', 'warning');
                return;
            }

            const btn = loginForm.querySelector('button');
            const originalText = btn.innerText;
            btn.innerText = 'Memasuk...';
            btn.disabled = true;

            try {
                const response = await fetch(`${API_URL}/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ no_hp, password })
                });

                const result = await response.json();

                if (response.ok) {
                    localStorage.setItem('token_temucepat', result.token);
                    localStorage.setItem('user_temucepat', JSON.stringify(result.user));

                    Swal.fire({
                        icon: 'success',
                        title: 'Login Berhasil!',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        if (result.user.role === 'ADMIN') {
                            window.location.href = 'admin_dashboard.html';
                        } else {
                            window.location.href = 'beranda.html';
                        }
                    });
                } else {
                    throw new Error(result.message || 'Login Gagal');
                }
            } catch (error) {
                Swal.fire('Gagal', error.message, 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});