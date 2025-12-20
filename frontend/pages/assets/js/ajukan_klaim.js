document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const API_LAPOR = 'http://localhost:5000/api/laporan';
    const API_KLAIM = 'http://localhost:5000/api/klaim';

    const idLaporanEl = document.getElementById('id_laporan');
    const namaEl = document.getElementById('nama_barang');
    const kategoriEl = document.getElementById('kategori');
    const lokasiEl = document.getElementById('lokasi');
    const tglEl = document.getElementById('tgl_hilang');
    const buktiEl = document.getElementById('bukti_kepemilikan');
    const kronoEl = document.getElementById('kronologi');
    const fotoEl = document.getElementById('foto_bukti');
    const previewBox = document.getElementById('uploadPreview');
    const previewImg = document.getElementById('previewImg');
    const removeBtn = document.getElementById('removePreview');
    const placeholder = document.getElementById('uploadPlaceholder');
    const submitBtn = document.getElementById('submitKlaim');
    const cancelBtn = document.getElementById('cancelKlaim');

    if (!id) {
        Swal.fire({ icon: 'error', title: 'ID tidak ditemukan', text: 'ID laporan tidak ada di URL.' }).then(() => window.location.href = 'beranda.html');
        return;
    }

    // Load laporan info
    try {
        const r = await fetch(`${API_LAPOR}/${id}`);
        const j = await r.json();
        if (!r.ok) throw new Error(j.message || 'Gagal ambil data laporan');
        const item = j.data;
        idLaporanEl.value = item.id_laporan;
        namaEl.value = item.nama_barang || '';
        kategoriEl.value = item.kategori || '';
        lokasiEl.value = item.lokasi_detail || '';
    } catch (err) {
        console.error('Load laporan error', err);
        Swal.fire({ icon: 'error', title: 'Gagal memuat data', text: err.message }).then(() => window.location.href = 'beranda.html');
        return;
    }

    // File preview logic
    fotoEl.addEventListener('change', () => {
        const f = fotoEl.files && fotoEl.files[0];
        if (f) {
            const reader = new FileReader();
            reader.onload = e => {
                previewImg.src = e.target.result;
                previewBox.style.display = 'block';
                placeholder.style.display = 'none';
            };
            reader.readAsDataURL(f);
        } else {
            previewImg.src = '';
            previewBox.style.display = 'none';
            placeholder.style.display = 'block';
        }
    });

    removeBtn.addEventListener('click', () => {
        fotoEl.value = '';
        previewImg.src = '';
        previewBox.style.display = 'none';
        placeholder.style.display = 'block';
    });

    // Cancel
    cancelBtn.addEventListener('click', () => window.history.back());

    // Submit
    document.getElementById('klaimForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token_temucepat');
        if (!token) {
            Swal.fire({ icon: 'warning', title: 'Perlu Login', text: 'Silakan login terlebih dahulu.' }).then(() => window.location.href = 'DAFTAR.html');
            return;
        }

        const bukti = buktiEl.value.trim();
        const tgl = tglEl.value;
        const krono = kronoEl.value.trim();

        if (!bukti || !tgl) {
            Swal.fire({ icon: 'warning', title: 'Form belum lengkap', text: 'Isi minimal deskripsi bukti dan tanggal kehilangan.' });
            return;
        }

        // Prepare FormData
        const fd = new FormData();
        fd.append('id_laporan', parseInt(idLaporanEl.value));
        fd.append('bukti_kepemilikan', bukti);
        fd.append('tgl_hilang', tgl);
        fd.append('kronologi', krono);
        if (fotoEl.files && fotoEl.files[0]) fd.append('foto', fotoEl.files[0]);

        submitBtn.disabled = true;
        submitBtn.textContent = 'Mengirim...';

        try {
            const res = await fetch(API_KLAIM, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: fd
            });
            const b = await res.json();
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Klaim Diajukan', text: b.message }).then(() => window.location.href = 'daftar_klaim.html');
            } else {
                Swal.fire({ icon: 'error', title: 'Gagal', text: b.message || 'Terjadi kesalahan' });
                if (res.status === 401 || res.status === 403) {
                    localStorage.removeItem('token_temucepat');
                    localStorage.removeItem('user_temucepat');
                    window.location.href = 'DAFTAR.html';
                }
            }
        } catch (err) {
            console.error('Submit klaim error', err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghubungi server.' });
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Kirim Klaim';
        }
    });
});