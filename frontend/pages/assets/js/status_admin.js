// GLOBAL LOGOUT
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

document.addEventListener('DOMContentLoaded', () => {
    const API_URL = 'http://localhost:5000/api'; // Base API
    const token = localStorage.getItem('token_temucepat');

    // 1. Fetch & Render Laporan
    async function loadReports() {
        try {
            // Ambil semua laporan (bukan /api/admin/laporan, tapi /api/laporan)
            const res = await fetch(`${API_URL}/laporan`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            
            const filter = document.getElementById('filterStatus').value;
            const tbody = document.getElementById('reportTableBody');
            tbody.innerHTML = '';

            let data = json.data || [];
            
            // Filter Client Side
            if (filter !== 'all') {
                data = data.filter(item => item.status === filter);
            }

            if (data.length === 0) {
                tbody.innerHTML = `<tr><td colspan="5" class="p-8 text-center text-gray-400">Tidak ada data.</td></tr>`;
                return;
            }

            data.forEach(item => {
                const date = new Date(item.created_at).toLocaleDateString('id-ID');
                
                // Badge Status
                let statusBadge = 'bg-gray-100 text-gray-600';
                if(item.status === 'MENUNGGU_VERIFIKASI') statusBadge = 'bg-yellow-100 text-yellow-700';
                if(item.status === 'DIPUBLIKASIKAN') statusBadge = 'bg-green-100 text-green-700';
                if(item.status === 'DITOLAK') statusBadge = 'bg-red-100 text-red-700';

                // Tombol Aksi (Hanya muncul jika Pending)
                let buttons = '<span class="text-gray-400 text-sm">-</span>';
                if (item.status === 'MENUNGGU_VERIFIKASI') {
                    buttons = `
                        <button onclick="updateStatus(${item.id || item.id_laporan}, 'DIPUBLIKASIKAN')" class="p-2 bg-green-100 text-green-600 rounded hover:bg-green-200 mr-2" title="Terima">
                            <i class="fas fa-check"></i>
                        </button>
                        <button onclick="updateStatus(${item.id || item.id_laporan}, 'DITOLAK')" class="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200" title="Tolak">
                            <i class="fas fa-times"></i>
                        </button>
                    `;
                }

                const row = `
                <tr class="hover:bg-gray-50 border-b border-gray-50">
                    <td class="p-4">
                        <div class="font-bold text-gray-800">${item.nama_barang}</div>
                        <div class="text-xs text-gray-500"><i class="fas fa-map-marker-alt text-red-400"></i> ${item.lokasi || item.lokasi_detail}</div>
                    </td>
                    <td class="p-4 text-sm">${item.user ? item.user.nama : 'Unknown'}</td>
                    <td class="p-4 text-sm text-gray-500">${date}</td>
                    <td class="p-4 text-center">
                        <span class="px-3 py-1 rounded text-xs font-bold ${statusBadge}">${item.status}</span>
                    </td>
                    <td class="p-4 text-right">${buttons}</td>
                </tr>`;
                tbody.innerHTML += row;
            });

        } catch (err) { console.error(err); }
    }

    // 2. Fungsi Update Status (Global Scope agar bisa dipanggil onclick)
    window.updateStatus = async function (id, newStatus) {
        try {
            Swal.fire({
                title: 'Konfirmasi',
                text: `Ubah status menjadi ${newStatus}?`,
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3b82f6',
                confirmButtonText: 'Ya'
            }).then(async (result) => {
                if (result.isConfirmed) {
                    // FETCH KE ROUTE YANG BENAR: /api/laporan/:id/verifikasi
                    const res = await fetch(`${API_URL}/laporan/${id}/verifikasi`, {
                        method: 'PATCH',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${token}`
                        },
                        body: JSON.stringify({ status: newStatus })
                    });

                    if (res.ok) {
                        Swal.fire('Berhasil', 'Status diperbarui', 'success');
                        loadReports(); // Refresh tabel
                    } else {
                        Swal.fire('Gagal', 'Terjadi kesalahan', 'error');
                    }
                }
            });
        } catch (err) { console.error(err); }
    };

    // Event Listener Filter
    document.getElementById('filterStatus').addEventListener('change', loadReports);

    // Load awal
    loadReports();
});