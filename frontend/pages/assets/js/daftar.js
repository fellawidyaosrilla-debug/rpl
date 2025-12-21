document.addEventListener('DOMContentLoaded', () => {
    
    const API_URL = 'http://localhost:5000/api/auth';
    
    // === REGISTER ===
    const regForm = document.getElementById('registerForm');
    if (regForm) {
        regForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const nama = document.getElementById('regName').value;
            const no_hp = document.getElementById('regPhone').value;
            const password = document.getElementById('regPassword').value;

            // Loading State
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

                if (response.ok) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Registrasi Berhasil!',
                        text: 'Silakan login dengan akun baru Anda.',
                        confirmButtonColor: '#3b82f6'
                    }).then(() => {
                        // Pindah ke tab login otomatis
                        switchTab('login');
                        regForm.reset();
                    });
                } else {
                    throw new Error(result.message || 'Gagal Mendaftar');
                }
            } catch (error) {
                Swal.fire('Gagal', error.message, 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }

    // === LOGIN ===
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const no_hp = document.getElementById('loginPhone').value;
            const password = document.getElementById('loginPassword').value;

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
                    // Simpan Token & User Data
                    localStorage.setItem('token_temucepat', result.token);
                    localStorage.setItem('user_temucepat', JSON.stringify(result.user));

                    Swal.fire({
                        icon: 'success',
                        title: 'Login Berhasil!',
                        text: 'Mengalihkan ke beranda...',
                        showConfirmButton: false,
                        timer: 1500
                    }).then(() => {
                        // Redirect Berdasarkan Role
                        if (result.user.role === 'ADMIN') {
                            window.location.href = 'admin_dashboard.html';
                        } else {
                            window.location.href = 'beranda.html';
                        }
                    });
                } else {
                    throw new Error(result.message || 'No HP atau Password Salah');
                }
            } catch (error) {
                Swal.fire('Login Gagal', error.message, 'error');
            } finally {
                btn.innerText = originalText;
                btn.disabled = false;
            }
        });
    }
});