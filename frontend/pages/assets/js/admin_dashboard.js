document.addEventListener('DOMContentLoaded', async function() {
    
    const API_URL = 'http://localhost:5000/api/admin';
    const token = localStorage.getItem('token_temucepat');
    const user = JSON.parse(localStorage.getItem('user_temucepat') || '{}');

    // 1. CEK OTORITAS (SATPAM)
    // Kalau tidak ada token ATAU role-nya bukan ADMIN
    if (!token || user.role !== 'ADMIN') {
        alert('⛔ Akses Ditolak! Halaman ini khusus Admin.');
        window.location.href = 'login awal.html'; // Tendang ke login
        return;
    }

    // Tampilkan Nama Admin di Pojok Kanan (Opsional, kalau ada elemennya)
    // document.getElementById('adminName').textContent = user.nama_lengkap;

    // 2. FUNGSI LOAD STATISTIK
    async function loadStats() {
        try {
            const response = await fetch(`${API_URL}/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}` // Wajib bawa "Tiket" Token
                }
            });

            if (!response.ok) {
                throw new Error('Gagal mengambil data statistik');
            }

            const json = await response.json();
            const data = json.data; // { totalUser, foundCount, lostCount, pendingCount }

            // 3. UPDATE TAMPILAN HTML
            document.getElementById('stat-total-user').textContent = data.totalUser;
            document.getElementById('stat-found').textContent = data.foundCount;
            document.getElementById('stat-lost').textContent = data.lostCount;
            document.getElementById('stat-pending').textContent = data.pendingCount;

        } catch (error) {
            console.error(error);
            // Jangan pakai alert biar gak ganggu, cukup log aja
            console.log('Gagal memuat dashboard. Cek koneksi server.');
        }
    }

    // 4. FUNGSI LOGOUT
    // Global logout function (tersedia di window) agar bisa dipanggil dari HTML
    window.logout = function() {
        Swal.fire({
            title: 'Keluar',
            text: 'Yakin ingin keluar dari akun?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Ya, Logout',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                localStorage.removeItem('token_temucepat');
                localStorage.removeItem('user_temucepat');
                window.location.href = 'DAFTAR.html';
            }
        });
    };

    // Pasang fallback ke tombol logout yang ada di DOM (jika teksnya mengandung 'Logout')
    const logoutBtns = document.querySelectorAll('button');
    logoutBtns.forEach(btn => {
        if (btn.textContent && btn.textContent.includes('Logout')) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                window.logout();
            });
        }
    });

    // Jalankan fungsi load
    loadStats();
});