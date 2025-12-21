document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token_temucepat');
    
    if (!token) {
        window.location.href = 'daftar.html';
        return;
    }

    const container = document.getElementById('klaimContainer');
    const loading = document.getElementById('loading');
    const emptyState = document.getElementById('emptyState');

    try {
        // 1. Fetch Data Klaim Masuk
        const response = await fetch('http://localhost:5000/api/klaim/masuk', {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        const result = await response.json();

        loading.classList.add('hidden');

        if (response.ok && result.data.length > 0) {
            container.classList.remove('hidden');
            
            // Render setiap kartu klaim
            container.innerHTML = result.data.map(item => createKlaimCard(item)).join('');
        } else {
            emptyState.classList.remove('hidden');
        }

    } catch (error) {
        console.error(error);
        loading.innerHTML = '<p class="text-red-500">Gagal memuat data.</p>';
    }
});

// FUNGSI MEMBUAT TAMPILAN KARTU
function createKlaimCard(item) {
    // Tentukan Warna Status
    let statusClass = 'bg-yellow-100 text-yellow-800';
    let statusText = 'Menunggu Verifikasi';
    
    if (item.status === 'DISETUJUI') {
        statusClass = 'bg-green-100 text-green-800';
        statusText = 'Disetujui';
    } else if (item.status === 'DITOLAK') {
        statusClass = 'bg-red-100 text-red-800';
        statusText = 'Ditolak';
    }

    // Tampilkan Foto Bukti jika ada
    const buktiImg = item.foto_bukti 
        ? `<img src="http://localhost:5000/${item.foto_bukti}" class="w-full h-32 object-cover rounded-lg border border-gray-200" onclick="window.open(this.src)">` 
        : `<div class="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-xs">Tidak ada foto bukti</div>`;

    // Tombol Aksi (Hanya muncul kalau status PENDING)
    const actionButtons = item.status === 'PENDING' ? `
        <div class="mt-6 flex gap-3 pt-4 border-t border-gray-100">
            <button onclick="verifikasi(${item.id_klaim}, 'DITOLAK')" class="flex-1 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 font-medium transition">
                <i class="fas fa-times"></i> Tolak
            </button>
            <button onclick="verifikasi(${item.id_klaim}, 'DISETUJUI')" class="flex-1 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 font-medium shadow-md transition">
                <i class="fas fa-check"></i> Terima & Beri WA
            </button>
        </div>
    ` : '';

    return `
    <div class="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden flex flex-col md:flex-row">
        <div class="p-6 md:w-1/3 bg-blue-50 border-r border-blue-100 flex flex-col justify-center items-center text-center">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl mb-3 shadow-sm">📦</div>
            <h3 class="font-bold text-gray-800 text-lg">${item.barang}</h3>
            <p class="text-sm text-gray-500 mb-2">Diklaim oleh:</p>
            <span class="px-3 py-1 bg-white rounded-full text-blue-600 font-bold text-sm shadow-sm border border-blue-100">
                ${item.pengklaim}
            </span>
            <span class="mt-4 px-3 py-1 rounded-full text-xs font-bold ${statusClass}">
                ${statusText}
            </span>
        </div>

        <div class="p-6 md:w-2/3">
            <h4 class="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <i class="fas fa-file-alt text-blue-500"></i> Bukti Kepemilikan
            </h4>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <p class="text-xs text-gray-400 uppercase font-bold mb-1">Deskripsi Detail</p>
                    <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">${item.deskripsi_klaim}</p>
                    
                    <p class="text-xs text-gray-400 uppercase font-bold mt-3 mb-1">Kronologi Kehilangan</p>
                    <p class="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg border border-gray-100">${item.kronologi || '-'}</p>
                </div>
                <div>
                    <p class="text-xs text-gray-400 uppercase font-bold mb-1">Foto Bukti</p>
                    ${buktiImg}
                </div>
            </div>

            ${actionButtons}
        </div>
    </div>
    `;
}

// FUNGSI VERIFIKASI (TERIMA / TOLAK)
window.verifikasi = async (idKlaim, status) => {
    const token = localStorage.getItem('token_temucepat');
    
    // Konfirmasi User
    const confirm = await Swal.fire({
        title: status === 'DISETUJUI' ? 'Terima Klaim?' : 'Tolak Klaim?',
        text: status === 'DISETUJUI' 
            ? "Pihak pengklaim akan menerima nomor WA Anda untuk janjian." 
            : "Pengklaim akan diberitahu bahwa klaim ditolak.",
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: status === 'DISETUJUI' ? '#10B981' : '#EF4444',
        confirmButtonText: 'Ya, Lanjutkan'
    });

    if (!confirm.isConfirmed) return;

    try {
        // FETCH KE ENDPOINT VERIFIKASI YANG BENAR
        const response = await fetch('http://localhost:5000/api/klaim/verifikasi', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ id_klaim: idKlaim, status: status })
        });

        const result = await response.json();

        if (response.ok) {
            Swal.fire('Berhasil!', `Klaim telah ${status === 'DISETUJUI' ? 'diterima' : 'ditolak'}.`, 'success')
            .then(() => location.reload());
        } else {
            throw new Error(result.message || 'Gagal memproses.');
        }

    } catch (error) {
        console.error(error);
        Swal.fire('Error', error.message, 'error');
    }
};