document.addEventListener('DOMContentLoaded', () => {
    // Cek Login Admin
    const user = JSON.parse(localStorage.getItem('user_temucepat') || '{}');
    const token = localStorage.getItem('token_temucepat');

    if (!token || user.role !== 'ADMIN') {
        window.location.href = 'login_awal.html'; // Redirect kalau bukan admin
        return;
    }

    // Load Data Laporan
    loadLaporanAdmin();
});

async function loadLaporanAdmin() {
    const token = localStorage.getItem('token_temucepat');
    const tableBody = document.getElementById('laporanTableBody'); // Pastikan ID ini ada di HTML tbody kamu
    
    if (!tableBody) return; // Stop jika tabel tidak ditemukan

    tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Memuat data...</td></tr>';

    try {
        // === INI KUNCINYA: Ambil dari endpoint '/semua' ===
        const response = await fetch('http://localhost:5000/api/laporan/semua', {
            headers: { 
                'Authorization': `Bearer ${token}` 
            }
        });

        const result = await response.json();

        if (response.ok) {
            tableBody.innerHTML = ''; // Bersihkan loading

            if (result.data.length === 0) {
                tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-4">Belum ada laporan masuk.</td></tr>';
                return;
            }

            result.data.forEach((item, index) => {
                // Tentukan Warna Badge Status
                let statusBadge = '';
                if (item.status === 'MENUNGGU_VERIFIKASI') {
                    statusBadge = '<span class="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-bold">Pending</span>';
                } else if (item.status === 'DIPUBLIKASIKAN') {
                    statusBadge = '<span class="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">Diterima</span>';
                } else {
                    statusBadge = '<span class="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">Ditolak</span>';
                }

                // Tombol Aksi (Hanya muncul jika status MENUNGGU_VERIFIKASI)
                let tombolAksi = '-';
                if (item.status === 'MENUNGGU_VERIFIKASI') {
                    tombolAksi = `
                        <button onclick="verifikasiLaporan(${item.id}, 'DIPUBLIKASIKAN')" class="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 mr-1">
                            <i class="fas fa-check"></i> Terima
                        </button>
                        <button onclick="verifikasiLaporan(${item.id}, 'DITOLAK')" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">
                            <i class="fas fa-times"></i> Tolak
                        </button>
                    `;
                }

                // Render Baris
                const row = `
                    <tr class="border-b hover:bg-gray-50">
                        <td class="py-3 px-4 text-center">${index + 1}</td>
                        <td class="py-3 px-4">
                            <div class="font-bold text-gray-800">${item.nama_barang}</div>
                            <div class="text-xs text-gray-500">${item.user?.nama || 'Anonim'}</div>
                        </td>
                        <td class="py-3 px-4">${item.jenis_laporan}</td>
                        <td class="py-3 px-4 text-xs">${new Date(item.created_at).toLocaleDateString()}</td>
                        <td class="py-3 px-4 text-center">${statusBadge}</td>
                        <td class="py-3 px-4 text-center">
                            ${tombolAksi}
                        </td>
                    </tr>
                `;
                tableBody.innerHTML += row;
            });
        } else {
            tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500">${result.message}</td></tr>`;
        }
    } catch (error) {
        console.error(error);
        tableBody.innerHTML = `<tr><td colspan="6" class="text-center text-red-500">Gagal mengambil data server.</td></tr>`;
    }
}

// Fungsi Update Status (Terima/Tolak)
window.verifikasiLaporan = async (id, statusBaru) => {
    const token = localStorage.getItem('token_temucepat');
    
    // Konfirmasi dulu
    const result = await Swal.fire({
        title: statusBaru === 'DIPUBLIKASIKAN' ? 'Terima Laporan?' : 'Tolak Laporan?',
        text: "Status laporan akan diperbarui.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Ya, Lanjutkan',
        cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
        const response = await fetch(`http://localhost:5000/api/laporan/${id}/verifikasi`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status: statusBaru })
        });

        if (response.ok) {
            Swal.fire('Berhasil!', 'Status laporan telah diperbarui.', 'success');
            loadLaporanAdmin(); // Refresh tabel otomatis
        } else {
            const res = await response.json();
            Swal.fire('Gagal', res.message, 'error');
        }
    } catch (error) {
        Swal.fire('Error', 'Terjadi kesalahan koneksi.', 'error');
    }
};