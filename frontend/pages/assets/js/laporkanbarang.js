document.addEventListener('DOMContentLoaded', function() {
    const API_URL = 'http://localhost:5000/api/laporan';
    const token = localStorage.getItem('token_temucepat');

    // 1. CEK LOGIN
    if (!token) {
        window.location.href = 'DAFTAR.html';
        return;
    }

    // --- SELECTOR ---
    const form = document.getElementById('laporanForm');
    const btnFound = document.getElementById('btnFound');
    const btnLost = document.getElementById('btnLost');
    const inputJenis = document.getElementById('jenis_laporan');
    const formTitle = document.getElementById('formTitle');
    const body = document.body;

    const fileInput = document.getElementById('foto_barang');
    const dropZone = document.getElementById('dropZone');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const uploadPreview = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');
    const removeBtn = document.getElementById('removeBtn');

    // 2. LOGIKA TOGGLE WARNA & MODE
    function setMode(mode) {
        inputJenis.value = mode;
        if (mode === 'PENEMUAN') {
            btnFound.classList.add('active');
            btnLost.classList.remove('active');
            formTitle.textContent = 'Lapor Penemuan Barang';
            body.classList.remove('mode-lost');
            body.classList.add('mode-found');
        } else {
            btnLost.classList.add('active');
            btnFound.classList.remove('active');
            formTitle.textContent = 'Lapor Kehilangan Barang';
            body.classList.remove('mode-found');
            body.classList.add('mode-lost');
        }
    }

    btnFound.addEventListener('click', () => setMode('PENEMUAN'));
    btnLost.addEventListener('click', () => setMode('KEHILANGAN'));

    // 3. LOGIKA UPLOAD FOTO
    dropZone.addEventListener('click', (e) => {
        if (e.target !== removeBtn && !removeBtn.contains(e.target)) {
            fileInput.click();
        }
    });

    fileInput.addEventListener('change', function() {
        const file = this.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                previewImg.src = e.target.result;
                uploadPlaceholder.style.display = 'none';
                uploadPreview.style.display = 'block';
            }
            reader.readAsDataURL(file);
        }
    });

    removeBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.value = '';
        uploadPlaceholder.style.display = 'block';
        uploadPreview.style.display = 'none';
        previewImg.src = '';
    });

    // 4. KIRIM DATA
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const btnSubmit = document.getElementById('submitBtn');
        
        const formData = new FormData();
        formData.append('jenis_laporan', inputJenis.value);
        formData.append('nama_barang', document.getElementById('nama_barang').value);
        formData.append('kategori', document.getElementById('kategori').value);
        formData.append('tgl_kejadian', document.getElementById('tgl_kejadian').value);
        formData.append('lokasi_detail', document.getElementById('lokasi').value);
        formData.append('deskripsi', document.getElementById('deskripsi').value);
        
        if (fileInput.files[0]) {
            formData.append('foto', fileInput.files[0]);
        }

        try {
            btnSubmit.innerHTML = 'Memproses...';
            btnSubmit.disabled = true;

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            if (response.ok) {
                Swal.fire({
                    icon: 'success',
                    title: 'Berhasil!',
                    text: 'Laporan Anda telah terkirim.',
                }).then(() => {
                    window.location.href = 'beranda.html';
                });
            } else {
                const res = await response.json();
                Swal.fire('Gagal', res.message || 'Terjadi kesalahan', 'error');
                btnSubmit.innerHTML = 'Kirim Laporan';
                btnSubmit.disabled = false;
            }
        } catch (err) {
            Swal.fire('Error', 'Server tidak merespon', 'error');
            btnSubmit.disabled = false;
        }
    });

    // Default Date
    document.getElementById('tgl_kejadian').valueAsDate = new Date();
});