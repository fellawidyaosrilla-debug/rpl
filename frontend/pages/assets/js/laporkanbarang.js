document.addEventListener('DOMContentLoaded', () => {
    
    // Cek Login
    const token = localStorage.getItem('token_temucepat');
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Akses Ditolak',
            text: 'Silakan login terlebih dahulu.',
            confirmButtonText: 'Login'
        }).then(() => window.location.href = 'daftar.html');
        return;
    }

    // Set tanggal hari ini sebagai default
    document.getElementById('tanggal').valueAsDate = new Date();
});

// --- 1. LOGIKA TOGGLE (TEMUAN vs KEHILANGAN) ---
window.setTipe = function(tipe) {
    const btnTemuan = document.getElementById('btnTemuan');
    const btnKehilangan = document.getElementById('btnKehilangan');
    const inputTipe = document.getElementById('jenisLaporan');
    const btnSubmit = document.getElementById('btnSubmit');

    inputTipe.value = tipe;

    if (tipe === 'DITEMUKAN') {
        // Style Hijau
        btnTemuan.className = "flex-1 py-4 text-center font-bold text-green-600 border-b-2 border-green-600 bg-green-50 transition-all";
        btnKehilangan.className = "flex-1 py-4 text-center font-bold text-gray-400 hover:text-red-500 transition-all";
        
        btnSubmit.className = "px-8 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2";
        btnSubmit.innerHTML = '<i class="fas fa-hand-holding-heart"></i> Lapor Penemuan';
    } else {
        // Style Merah
        btnKehilangan.className = "flex-1 py-4 text-center font-bold text-red-600 border-b-2 border-red-600 bg-red-50 transition-all";
        btnTemuan.className = "flex-1 py-4 text-center font-bold text-gray-400 hover:text-green-500 transition-all";
        
        btnSubmit.className = "px-8 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold shadow-lg transform hover:-translate-y-1 transition-all flex items-center gap-2";
        btnSubmit.innerHTML = '<i class="fas fa-search"></i> Lapor Kehilangan';
    }
};

// --- 2. PREVIEW IMAGE ---
window.previewImage = function(input) {
    const preview = document.getElementById('imgPreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.src = e.target.result;
            preview.classList.remove('hidden');
            placeholder.classList.add('hidden');
        }
        reader.readAsDataURL(input.files[0]);
    }
};

// --- 3. SUBMIT FORM KE BACKEND ---
document.getElementById('laporForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const token = localStorage.getItem('token_temucepat');
    const formData = new FormData();

    // Ambil Data
    formData.append('jenis_laporan', document.getElementById('jenisLaporan').value);
    formData.append('nama_barang', document.getElementById('namaBarang').value);
    formData.append('kategori', document.getElementById('kategori').value);
    formData.append('tgl_kejadian', document.getElementById('tanggal').value);
    formData.append('lokasi', document.getElementById('lokasi').value);
    formData.append('deskripsi', document.getElementById('deskripsi').value);
    
    // File Foto (Opsional tapi disarankan)
    const fileInput = document.getElementById('fotoBarang');
    if (fileInput.files[0]) {
        formData.append('foto', fileInput.files[0]);
    }

    // Loading State
    const btn = document.getElementById('btnSubmit');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    btn.disabled = true;

    try {
        const response = await fetch('http://localhost:5000/api/laporan', {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }, // Header Auth
            body: formData // JANGAN set Content-Type manual kalau pakai FormData
        });

        const result = await response.json();

        if (response.ok) {
            Swal.fire({
                icon: 'success',
                title: 'Laporan Terkirim!',
                text: 'Laporan Anda akan diverifikasi oleh Admin.',
                confirmButtonColor: '#3b82f6'
            }).then(() => {
                window.location.href = 'kelola_laporan.html'; // Redirect ke dashboard user
            });
        } else {
            throw new Error(result.message || 'Gagal mengirim laporan');
        }

    } catch (error) {
        console.error(error);
        Swal.fire('Gagal', error.message, 'error');
    } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
    }
});