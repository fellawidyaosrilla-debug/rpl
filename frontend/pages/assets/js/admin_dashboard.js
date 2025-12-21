document.addEventListener('DOMContentLoaded', async () => {
    
    const API_URL = 'http://localhost:5000/api/laporan'; 
    const token = localStorage.getItem('token_temucepat');
    
    // Cek Admin
    const user = JSON.parse(localStorage.getItem('user_temucepat') || '{}');
    if (!token || user.role !== 'ADMIN') {
        window.location.href = 'daftar.html';
        return;
    }

    // 1. Load Statistik
    async function loadStats() {
        try {
            const res = await fetch(`${API_URL}/stats/dashboard`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            
            if (json.status === 'success') {
                const d = json.data;
                document.getElementById('stat-total-user').textContent = d.totalUser;
                document.getElementById('stat-found').textContent = d.barangDitemukan;
                document.getElementById('stat-lost').textContent = d.barangHilang;
                document.getElementById('stat-pending').textContent = d.pending;
            }
        } catch (err) { console.error('Stats Error:', err); }
    }

    // 2. Load Aktivitas Terbaru
    async function loadRecent() {
        try {
            const res = await fetch(`${API_URL}/stats/recent`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            const tbody = document.getElementById('recentActivityTable');
            tbody.innerHTML = '';

            if (json.data && json.data.length > 0) {
                json.data.forEach(item => {
                    const date = new Date(item.created_at).toLocaleDateString('id-ID');
                    let badge = item.status === 'DIPUBLIKASIKAN' ? 'bg-green-100 text-green-700' : 
                                item.status === 'DITOLAK' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700';

                    const row = `
                    <tr class="hover:bg-gray-50 border-b border-gray-50 last:border-0">
                        <td class="p-4 font-medium text-gray-700">${item.user ? item.user.nama : 'User'}</td>
                        <td class="p-4 text-gray-600">Lapor: ${item.nama_barang}</td>
                        <td class="p-4 text-gray-500 text-xs">${date}</td>
                        <td class="p-4 text-right"><span class="px-2 py-1 rounded text-xs font-bold ${badge}">${item.status}</span></td>
                    </tr>`;
                    tbody.innerHTML += row;
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="4" class="p-6 text-center text-gray-400">Belum ada aktivitas</td></tr>';
            }
        } catch (err) { console.error('Recent Error:', err); }
    }

    loadStats();
    loadRecent();
});

// LOGOUT GLOBAL (Bisa dipanggil dari HTML)
window.logout = function () {
    Swal.fire({
        title: 'Keluar Admin?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Keluar'
    }).then((result) => {
        if (result.isConfirmed) {
            localStorage.clear();
            window.location.href = 'daftar.html';
        }
    });
};