document.addEventListener('DOMContentLoaded', async function() {
    
    const API_URL = 'http://localhost:5000/api/laporan';
    const BACKEND_URL = 'http://localhost:5000';
    
    // Elements
    const itemsGrid = document.getElementById('itemsGrid');
    const itemsCount = document.getElementById('itemsCount');
    const searchInput = document.getElementById('searchInput'); 
    const categoryButtons = document.querySelectorAll('.category-btn'); 
    
    // State
    let currentCategory = 'Semua';
    let currentSearch = '';
    let allData = []; 

    // =========================================
    // 1. SETUP NAVBAR & LOGOUT (FIXED)
    // =========================================
    function setupNavbar() {
        const userBtn = document.getElementById('userBtn');
        const userName = document.getElementById('userName');
        const userDropdown = document.getElementById('userDropdown');
        const logoutBtn = document.getElementById('logoutBtn');
        const notifBtn = document.getElementById('notifBtn');

        const token = localStorage.getItem('token_temucepat');
        const userStr = localStorage.getItem('user_temucepat');
        let user = {};

        try { user = JSON.parse(userStr || '{}'); } catch (e) {}

        // --- Logic Tampilan ---
        if (token && user.nama) {
            // Sudah Login
            if (userName) userName.textContent = user.nama.split(' ')[0];
            
            // Dropdown Toggle
            if (userBtn && userDropdown) {
                userBtn.onclick = (e) => {
                    e.stopPropagation();
                    userDropdown.classList.toggle('hidden');
                };
            }
        } else {
            // Belum Login
            if (userName) userName.textContent = "Masuk";
            if (userBtn) {
                userBtn.onclick = () => window.location.href = 'daftar.html';
            }
        }

        // --- Logic Logout (Super Robust) ---
        if (logoutBtn) {
            // Hapus event listener lama dengan cloneNode
            const newLogoutBtn = logoutBtn.cloneNode(true);
            logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);

            newLogoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                Swal.fire({
                    title: 'Yakin ingin keluar?',
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                    confirmButtonText: 'Ya, Keluar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        localStorage.clear();
                        window.location.replace('daftar.html');
                    }
                });
            });
        }

        // Tutup dropdown jika klik di luar
        document.addEventListener('click', (e) => {
            if (userBtn && userDropdown && !userBtn.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.add('hidden');
            }
        });

        // Notifikasi
        if (notifBtn) {
            notifBtn.onclick = () => Swal.fire('Info', 'Belum ada notifikasi baru.', 'info');
        }
    }

    // =========================================
    // 2. LOAD DATA
    // =========================================
    async function loadBarang() {
        try {
            if(itemsGrid) itemsGrid.innerHTML = '<p class="text-center col-span-full py-10">Memuat data...</p>';

            const response = await fetch(API_URL);
            const json = await response.json();
            
            if (!json.data || json.data.length === 0) {
                allData = [];
                renderEmpty();
                return;
            }

            allData = json.data; 
            renderItems();

        } catch (error) {
            console.error('Error:', error);
            if(itemsGrid) itemsGrid.innerHTML = '<p class="text-center text-red-500 col-span-full py-10">Gagal memuat data.</p>';
        }
    }

    // =========================================
    // 3. RENDER ITEMS
    // =========================================
    function renderItems() {
        if (!itemsGrid) return;
        itemsGrid.innerHTML = '';

        // Filter
        const filteredData = allData.filter(item => {
            const matchCat = currentCategory === 'Semua' || (item.kategori && item.kategori === currentCategory);
            const matchSearch = item.nama_barang.toLowerCase().includes(currentSearch.toLowerCase());
            return matchCat && matchSearch;
        });

        // Update Count
        if(itemsCount) itemsCount.textContent = `${filteredData.length} barang tersedia`;

        // Empty State
        if (filteredData.length === 0) {
            renderEmpty();
            return;
        }

        // Loop Data
        filteredData.forEach(item => {
            // Status Logic
            const isFound = item.jenis_laporan === 'DITEMUKAN'; 
            const statusClass = isFound ? 'bg-green-100 text-green-700 border-green-200' : 'bg-red-100 text-red-700 border-red-200';
            const statusText = isFound ? 'DITEMUKAN' : 'HILANG'; 
            
            // Date Logic
            const dateObj = new Date(item.created_at || item.tgl_kejadian);
            const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });

            // Image Logic
            const imgUrl = item.foto ? `${BACKEND_URL}/${item.foto}` : 'https://placehold.co/600x400?text=No+Image';
            
            // Location Logic
            const lokasiFix = item.lokasi || item.lokasi_detail || 'Lokasi tidak diketahui';

            const card = `
                <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 flex flex-col h-full group">
                    <div class="h-48 relative overflow-hidden bg-gray-50">
                        <img src="${imgUrl}" alt="${item.nama_barang}" class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110">
                        <span class="absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-bold ${statusClass} uppercase border shadow-sm z-10">
                            ${statusText}
                        </span>
                    </div>

                    <div class="p-4 flex flex-col flex-1">
                        <h3 class="font-bold text-lg text-gray-800 mb-1 truncate" title="${item.nama_barang}">${item.nama_barang}</h3>
                        
                        <div class="flex items-center gap-2 text-sm text-gray-500 mb-2">
                             <i class="fas fa-map-marker-alt text-red-400 flex-shrink-0"></i> 
                             <span class="truncate">${lokasiFix}</span>
                        </div>
                        
                        <div class="flex items-center gap-2 text-xs text-gray-400 mb-4">
                             <i class="far fa-clock flex-shrink-0"></i> 
                             <span>${dateStr}</span>
                        </div>
                        
                        <div class="mt-auto">
                            <button onclick="window.location.href='detail.html?id=${item.id || item.id_laporan}'" 
                                class="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
                                Lihat Detail
                            </button>
                        </div>
                    </div>
                </div>
            `;
            itemsGrid.innerHTML += card;
        });
    }

    function renderEmpty() {
        if(itemsGrid) {
            itemsGrid.innerHTML = `
                <div class="col-span-full text-center py-16 text-gray-400 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                    <i class="fas fa-box-open text-5xl mb-4 text-gray-300"></i>
                    <p class="text-lg font-medium text-gray-500">Tidak ada barang yang cocok.</p>
                </div>`;
        }
        if(itemsCount) itemsCount.textContent = "0 barang tersedia";
    }

    // =========================================
    // 4. EVENT LISTENERS
    // =========================================
    
    // Search
    if(searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentSearch = e.target.value;
            renderItems();
        });
    }

    // Kategori
    if(categoryButtons) {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => {
                    b.classList.remove('bg-blue-600', 'text-white', 'shadow-md');
                    b.classList.add('bg-white', 'text-gray-600', 'hover:bg-gray-50');
                });
                btn.classList.remove('bg-white', 'text-gray-600', 'hover:bg-gray-50');
                btn.classList.add('bg-blue-600', 'text-white', 'shadow-md');

                currentCategory = btn.innerText.trim(); 
                renderItems();
            });
        });
    }

    // =========================================
    // 5. INIT
    // =========================================
    setupNavbar();
    loadBarang();
});