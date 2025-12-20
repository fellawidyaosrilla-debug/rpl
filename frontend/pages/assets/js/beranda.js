// ==========================================
// 1. FUNGSI CEK AKSES LAPOR (AUTH GUARD)
// Ditaruh di luar agar bisa dipanggil HTML onclick
// ==========================================
function cekAksesLapor(event) {
    if(event) event.preventDefault(); // Jangan pindah halaman dulu

    const token = localStorage.getItem('token_temucepat');

    if (token) {
        // A. SUDAH LOGIN -> Masuk ke halaman lapor
        // (Pastikan file laporannya sudah ada, misal laporkan.html)
        window.location.href = 'laporkanbarang.html'; 
    } else {
        // B. BELUM LOGIN -> Tampilkan Peringatan & Arahkan ke DAFTAR.HTML
        Swal.fire({
            icon: 'warning',
            title: 'Belum Login',
            text: 'Anda harus login terlebih dahulu untuk melaporkan barang!',
            confirmButtonText: 'Login / Daftar',
            confirmButtonColor: '#3b82f6',
            showCancelButton: true,
            cancelButtonText: 'Batal'
        }).then((result) => {
            if (result.isConfirmed) {
                // --- REVISI DI SINI: ARAHKAN KE DAFTAR.HTML ---
                window.location.href = 'DAFTAR.html'; 
            }
        });
    }
}

// ==========================================
// 2. LOGIKA UTAMA SAAT HALAMAN DIMUAT
// ==========================================
document.addEventListener('DOMContentLoaded', async function() {
    
    const API_URL = 'http://localhost:5000/api/laporan';
    const itemsGrid = document.getElementById('itemsGrid');
    const itemsCount = document.getElementById('itemsCount');
    
    // Element Navbar
    const userBtn = document.getElementById('userBtn');
    const userName = document.getElementById('userName');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');

    // --- A. CEK STATUS LOGIN (Ubah Tampilan Navbar) ---
    const token = localStorage.getItem('token_temucepat');
    const user = JSON.parse(localStorage.getItem('user_temucepat') || '{}');

    if (token && user.nama) {
        // User Sedang Login
        userName.textContent = user.nama.split(' ')[0]; // Ambil nama depan
        userBtn.onclick = function() {
            userDropdown.classList.toggle('show'); // Tampilkan dropdown logout
        };
    } else {
        // User Belum Login
        userName.textContent = "Login";
        userBtn.onclick = function() {
            // --- REVISI DI SINI: ARAHKAN KE DAFTAR.HTML ---
            window.location.href = 'DAFTAR.html'; 
        };
    }

    // --- B. LOGOUT LOGIC ---
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Swal.fire({
                title: 'Yakin ingin keluar?',
                icon: 'question',
                showCancelButton: true,
                confirmButtonText: 'Ya, Logout',
                cancelButtonText: 'Batal'
            }).then((result) => {
                if (result.isConfirmed) {
                    localStorage.removeItem('token_temucepat');
                    localStorage.removeItem('user_temucepat');
                    // Refresh halaman atau kembalikan ke landing page
                    window.location.reload(); 
                }
            });
        });
    }

    // Notification button & badge
    const notificationBtn = document.getElementById('notificationBtn');
    const notificationBadge = document.querySelector('.notification-badge');

    function updateNotifBadge(count) {
        if (!notificationBadge) return;
        if (count && count > 0) {
            notificationBadge.style.display = 'inline-block';
            notificationBadge.textContent = count > 99 ? '99+' : String(count);
        } else {
            notificationBadge.style.display = 'none';
            notificationBadge.textContent = '';
        }
    }

    async function loadNotifCount() {
        const tokenLocal = localStorage.getItem('token_temucepat');
        if (!tokenLocal) { updateNotifBadge(0); return; }
        try {
            const res = await fetch('http://localhost:5000/api/notifikasi', {
                headers: { 'Authorization': `Bearer ${tokenLocal}` }
            });
            if (!res.ok) { updateNotifBadge(0); return; }
            const j = await res.json();
            const notifs = j.data || [];
            const unread = notifs.filter(n => !n.is_read).length;
            updateNotifBadge(unread);
        } catch (err) {
            console.warn('Load notif count failed', err);
            updateNotifBadge(0);
        }
    }

    if (notificationBtn) {
        notificationBtn.addEventListener('click', function() {
            const tokenLocal = localStorage.getItem('token_temucepat');
            if (!tokenLocal) {
                Swal.fire({ icon: 'warning', title: 'Perlu Login', text: 'Silakan login untuk melihat notifikasi.' }).then(() => window.location.href = 'DAFTAR.html');
                return;
            }
            window.location.href = 'notifikasi.html';
        });
    }

    // --- C. LOAD DATA BARANG DARI BACKEND ---
    let allItems = []; // Cache semua item untuk filtering/search

    function renderItems(list) {
        itemsGrid.innerHTML = '';
        if (!list || list.length === 0) {
            itemsGrid.innerHTML = `
                <div style="grid-column: 1/-1; text-align: center; padding: 40px;">
                    <i class="fas fa-box-open" style="font-size: 48px; color: #ccc;"></i>
                    <p style="margin-top: 10px; color: #666;">Belum ada barang dilaporkan.</p>
                </div>`;
            itemsCount.textContent = "0 barang tersedia";
            return;
        }

        itemsCount.textContent = `${list.length} barang tersedia`;

        list.forEach(item => {
            const isFound = item.jenis_laporan === 'PENEMUAN'; 
            const statusClass = isFound ? 'status-found' : 'status-lost';
            const statusText = isFound ? 'DITEMUKAN' : 'HILANG';

            const dateObj = new Date(item.tgl_kejadian);
            const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            const imgUrl = item.foto_barang 
                ? `http://localhost:5000/${item.foto_barang}` 
                : 'https://placehold.co/600x400?text=No+Image';

            const card = `
                <div class="item-card">
                    <div class="item-image-container">
                        <img src="${imgUrl}" alt="${item.nama_barang}" class="item-image">
                    </div>
                    <div class="item-content">
                        <div class="item-status ${statusClass}">${statusText}</div>
                        <h3 class="item-title">${item.nama_barang}</h3>
                        <div class="item-meta">
                            <div class="item-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>${item.lokasi_detail}</span>
                            </div>
                            <div class="item-date">
                                <i class="far fa-clock"></i>
                                <span>${dateStr}</span>
                            </div>
                        </div>
                        <div class="item-actions">
                            <button class="detail-btn" onclick="window.location.href='detail.html?id=${item.id_laporan}'">
                                <i class="fas fa-info-circle"></i> Lihat Detail
                            </button>
                        </div>
                    </div>
                </div>
            `;
            itemsGrid.innerHTML += card;
        });
    }

    async function loadBarang() {
        try {
            const response = await fetch(API_URL);
            const json = await response.json();

            allItems = json.data || [];
            renderItems(allItems);

        } catch (error) {
            console.error(error);
            itemsGrid.innerHTML = '<p style="text-align:center; color:red;">Gagal memuat data. Cek Backend.</p>';
        }
    }

    // Filtering: Category buttons
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(ci => ci.addEventListener('click', function() {
        categoryItems.forEach(x => x.classList.remove('active'));
        this.classList.add('active');
        const cat = this.dataset.category;
        if (cat === 'all') {
            renderItems(allItems);
        } else {
            const filtered = allItems.filter(i => i.kategori && i.kategori.toLowerCase().includes(cat.toLowerCase()));
            renderItems(filtered);
        }
    }));

    // Search handling
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    searchBtn.addEventListener('click', () => {
        const q = (searchInput.value || '').toLowerCase().trim();
        if (!q) return renderItems(allItems);
        const filtered = allItems.filter(i => i.nama_barang && i.nama_barang.toLowerCase().includes(q));
        renderItems(filtered);
    });

    // Jalankan Load Barang
    loadBarang();

    // Tutup dropdown kalau klik di luar
    document.addEventListener('click', function(e) {
        if (!userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('show');
        }
    });
});