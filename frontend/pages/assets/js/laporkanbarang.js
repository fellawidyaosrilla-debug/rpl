document.addEventListener('DOMContentLoaded', () => {
    
    // === 1. KONFIGURASI ===
    const API_URL = 'http://localhost:5000/api/laporan';
    const token = localStorage.getItem('token_temucepat');

    // Cek Login
    if (!token) {
        Swal.fire({
            icon: 'warning',
            title: 'Akses Ditolak',
            text: 'Silakan login terlebih dahulu!'
        }).then(() => {
            window.location.href = 'daftar.html';
        });
        return;
    }

    // === 2. LOGIKA TOGGLE (GANTI STATUS) ===
    const btnFound = document.getElementById('btnFound');
    const btnLost = document.getElementById('btnLost');
    const hiddenInput = document.getElementById('jenis_laporan');
    const body = document.body;
    const formTitle = document.getElementById('formTitle');

    // Fungsi Update Tampilan
    function updateStatus(type) {
        if (type === 'DITEMUKAN') {
            // Mode DITEMUKAN (Hijau)
            btnFound.classList.add('active');
            btnLost.classList.remove('active');
            body.classList.remove('mode-lost');
            body.classList.add('mode-found');
            formTitle.innerText = 'Lapor Penemuan Barang';
            hiddenInput.value = 'DITEMUKAN'; // <--- PENTING: Set ke DITEMUKAN
        } else {
            // Mode KEHILANGAN (Merah)
            btnLost.classList.add('active');
            btnFound.classList.remove('active');
            body.classList.remove('mode-found');
            body.classList.add('mode-lost');
            formTitle.innerText = 'Lapor Kehilangan Barang';
            hiddenInput.value = 'KEHILANGAN';
        }
    }

    // Event Listener Tombol
    btnFound.addEventListener('click', () => updateStatus('DITEMUKAN'));
    btnLost.addEventListener('click', () => updateStatus('KEHILANGAN'));

    // Set default saat loading (Baca dari HTML awal)
    // HTML kamu defaultnya 'PENEMUAN', kita paksa ubah jadi 'DITEMUKAN' saat start
    updateStatus('DITEMUKAN'); 


    // === 3. LOGIKA UPLOAD PREVIEW ===
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('foto_barang');
    const previewContainer = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');
    const removeBtn = document.getElementById('removeBtn');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');

    // Klik area -> Buka file explorer
    dropZone.addEventListener('click', () => fileInput.click());

    // Saat file dipilih
    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                previewContainer.style.display = 'block';
                uploadPlaceholder.style.display = 'none';
            }
            reader.readAsDataURL(file);
        }
    });

    // Hapus foto
    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Biar gak kebuka lagi file explorernya
        fileInput.value = '';
        previewContainer.style.display = 'none';
        uploadPlaceholder.style.display = 'flex';
    });


    // === 4. LOGIKA SUBMIT FORM (PENTING) ===
    const form = document.getElementById('laporanForm');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Ambil tombol submit biar bisa loading state
        const submitBtn = document.getElementById('submitBtn');
        const originalText = submitBtn.innerText;
        submitBtn.innerText = 'Mengirim...';
        submitBtn.disabled = true;

        try {
            // Gunakan FormData untuk kirim file + text
            const formData = new FormData();

            formData.append('nama_barang', document.getElementById('nama_barang').value);
            formData.append('kategori', document.getElementById('kategori').value);
            formData.append('tgl_kejadian', document.getElementById('tgl_kejadian').value);
            formData.append('lokasi_detail', document.getElementById('lokasi').value); // Backend: lokasi_detail
            formData.append('deskripsi', document.getElementById('deskripsi').value);
            
            // PENTING: Ambil nilai hidden input yang sudah diperbaiki logicnya di atas
            formData.append('jenis_laporan', hiddenInput.value); 

            // Ambil file foto jika ada
            if (fileInput.files[0]) {
                formData.append('foto', fileInput.files[0]);
            }

            // Kirim ke Backend
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Jangan set Content-Type kalau pakai FormData, browser otomatis set boundary
                },
                body: formData
            });

            const result = await response.json();

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Laporan Anda berhasil dikirim dan menunggu verifikasi admin.',
                    confirmButtonColor: '#3b82f6'
                }).then(() => {
                    window.location.href = 'beranda.html';
                });
            } else {
                throw new Error(result.message || 'Gagal mengirim laporan');
            }

        } catch (error) {
            console.error(error);
            Swal.fire({
                icon: 'error',
                title: 'Gagal',
                text: error.message
            });
        } finally {
            submitBtn.innerText = originalText;
            submitBtn.disabled = false;
        }
    });
});