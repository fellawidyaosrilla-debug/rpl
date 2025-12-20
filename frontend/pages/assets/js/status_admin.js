// === KONFIGURASI ===
const BASE_URL = 'http://localhost:5000/api/admin';
const tokenKey = 'token_temucepat';
const token = localStorage.getItem(tokenKey);
const user = JSON.parse(localStorage.getItem('user_temucepat') || '{}');

// Guard: jika tidak ada token atau role bukan ADMIN, redirect ke DAFTAR
if (!token || user.role !== 'ADMIN') {
    alert('⛔ Akses Ditolak! Silakan login sebagai Admin.');
    window.location.href = 'DAFTAR.html';
}

// Global logout function
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
            localStorage.removeItem(tokenKey);
            localStorage.removeItem('user_temucepat');
            window.location.href = 'DAFTAR.html';
        }
    });
};

// === FUNGSI AMBIL DATA DARI DATABASE ===
async function fetchReports() {
    try {
        const response = await fetch(`${BASE_URL}/laporan`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Gagal mengambil data dari server');
        
        const result = await response.json();
        return result.data; // Mengambil array laporan hasil include barang & pelapor
    } catch (error) {
        console.error("Error Fetching:", error);
        return [];
    }
}

// === RENDER TABEL VERIFIKASI ===
async function renderTable() {
    const tableBody = document.getElementById('reportTableBody');
    const filterValue = document.getElementById('filterStatus').value;
    const countPendingEl = document.getElementById('count-pending');
    
    tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8">Memuat data terbaru...</td></tr>';

    const reportsData = await fetchReports();
    tableBody.innerHTML = ''; 

    // Update Angka Menunggu Verifikasi di Dashboard
    const pendingCount = reportsData.filter(r => r.status === 'MENUNGGU_VERIFIKASI').length;
    if(countPendingEl) countPendingEl.textContent = pendingCount;

    // Logika Filter
    let filteredData = reportsData;
    if (filterValue !== 'all') {
        filteredData = reportsData.filter(r => r.status === filterValue);
    }

    if (filteredData.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-gray-500">Tidak ada laporan ditemukan.</td></tr>`;
        return;
    }

    filteredData.forEach(item => {
        // Tipe Laporan (Kehilangan/Penemuan)
        let typeBadge = item.jenis_laporan === 'KEHILANGAN' 
            ? '<span class="px-2 py-1 text-xs font-semibold rounded-md bg-red-100 text-red-600">Kehilangan</span>'
            : '<span class="px-2 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-600">Ditemukan</span>';

        // Status Laporan (Sesuai Enum Prisma)
        let statusBadge = '';
        if (item.status === 'MENUNGGU_VERIFIKASI') {
            statusBadge = '<span class="px-3 py-1 text-xs font-bold rounded-full bg-yellow-100 text-yellow-700 border border-yellow-200">Menunggu</span>';
        } else if (item.status === 'DIPUBLIKASIKAN') {
            statusBadge = '<span class="px-3 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-700 border border-blue-200">Publik</span>';
        } else {
            statusBadge = '<span class="px-3 py-1 text-xs font-bold rounded-full bg-gray-100 text-gray-600 border border-gray-200">Ditolak</span>';
        }

        // Tombol Aksi (PATCH ke backend)
        let actionButtons = '';
        if (item.status === 'MENUNGGU_VERIFIKASI') {
            actionButtons = `
                <div class="flex items-center justify-end gap-2">
                    <button onclick="updateStatus(${item.id_laporan}, 'SETUJU')" class="p-2 rounded-full bg-green-100 text-green-600 hover:bg-green-600 hover:text-white transition-all">
                        <i class="fas fa-check"></i>
                    </button>
                    <button onclick="updateStatus(${item.id_laporan}, 'TOLAK')" class="p-2 rounded-full bg-red-100 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        } else {
            actionButtons = `<span class="text-xs text-gray-400 italic">Selesai</span>`;
        }

        const row = `
            <tr class="hover:bg-gray-50 border-b">
                <td class="px-6 py-4">
                    <div class="flex items-center">
                        <img class="h-10 w-10 rounded object-cover mr-3" 
                             src="http://localhost:5000/${item.barang.foto_barang}" 
                             onerror="this.src='https://placehold.co/50x50?text=No+Img'">
                        <div>
                            <div class="text-sm font-bold text-gray-900">${item.barang.nama_barang}</div>
                            <div class="text-xs text-gray-500">${item.barang.deskripsi}</div>
                        </div>
                    </div>
                </td>
                <td class="px-6 py-4">${typeBadge}</td>
                <td class="px-6 py-4 text-sm">
                    ${item.barang.lokasi_detail}<br>
                    <small class="text-gray-400">${new Date(item.barang.tgl_ditemukan).toLocaleDateString('id-ID')}</small>
                </td>
                <td class="px-6 py-4 text-sm">
                    ${item.pelapor.nama_lengkap}<br>
                    <small class="text-gray-400">${item.pelapor.no_hp}</small>
                </td>
                <td class="px-6 py-4">${statusBadge}</td>
                <td class="px-6 py-4 text-right">${actionButtons}</td>
            </tr>
        `;
        tableBody.innerHTML += row;
    });
}

// === FUNGSI UPDATE STATUS KE BACKEND ===
async function updateStatus(id, tindakan) {
    const actionLabel = tindakan === 'SETUJU' ? 'menyetujui' : 'menolak';

    const confirmResult = await Swal.fire({
        title: tindakan === 'SETUJU' ? 'Setujui Laporan' : 'Tolak Laporan',
        text: `Yakin ingin ${actionLabel} laporan ini?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: tindakan === 'SETUJU' ? 'Ya, Setujui' : 'Ya, Tolak',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#3085d6'
    });

    if (!confirmResult.isConfirmed) return;

    try {
        const response = await fetch(`${BASE_URL}/verifikasi/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ tindakan: tindakan })
        });

        const resJson = await response.json();

        if (response.ok) {
            await Swal.fire({ icon: 'success', title: 'Sukses', text: resJson.message || 'Status diperbarui' });
            renderTable(); // Muat ulang tabel setelah status berubah
        } else {
            await Swal.fire({ icon: 'error', title: 'Gagal update', text: resJson.message || 'Terjadi kesalahan' });

            // Jika token tidak valid, hapus data auth dan redirect ke DAFTAR
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem(tokenKey);
                localStorage.removeItem('user_temucepat');
                window.location.href = 'DAFTAR.html';
            }
        }
    } catch (error) {
        console.error("Error Updating:", error);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Terjadi kesalahan saat menghubungi server.' });
    }
}

// Jalankan saat halaman dimuat
document.addEventListener('DOMContentLoaded', renderTable);