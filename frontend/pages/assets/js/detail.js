document.addEventListener('DOMContentLoaded', async () => {
    
    // --- SETUP AWAL ---
    const urlParams = new URLSearchParams(window.location.search);
    const idLaporan = urlParams.get('id');
    const token = localStorage.getItem('token_temucepat');
    const API_URL = `http://localhost:5000/api/laporan/${idLaporan}`;
    const KLAIM_URL = 'http://localhost:5000/api/klaim';
    const BACKEND_URL = 'http://localhost:5000';

    if (!idLaporan) {
        window.location.href = 'beranda.html';
        return;
    }

    // --- FETCH DETAIL BARANG ---
    try {
        const response = await fetch(API_URL);
        const json = await response.json();
        const data = json.data;

        // Render Data Barang
        document.getElementById('detailFoto').src = data.foto ? `${BACKEND_URL}/${data.foto}` : 'https://placehold.co/600x400';
        document.getElementById('detailNama').innerText = data.nama_barang;
        document.getElementById('detailKategori').innerText = data.kategori || 'Umum';
        document.getElementById('detailLokasi').innerText = data.lokasi || data.lokasi_detail;
        document.getElementById('detailDeskripsi').innerText = data.deskripsi || '-';
        document.getElementById('detailTanggal').innerText = new Date(data.created_at).toLocaleDateString('id-ID');

        // Badge Status
        const badge = document.getElementById('detailBadge');
        badge.innerText = data.jenis_laporan || 'KEHILANGAN';
        if (data.jenis_laporan === 'DITEMUKAN') {
            badge.className = 'absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold bg-green-100 text-green-700';
        } else {
            badge.className = 'absolute top-4 left-4 px-4 py-2 rounded-full text-sm font-bold bg-red-100 text-red-700';
        }

        // Tampilkan konten
        document.getElementById('loading').classList.add('hidden');
        document.getElementById('detailContent').classList.remove('hidden');

    } catch (err) {
        console.error(err);
        alert('Gagal memuat data');
    }

    // --- LOGIC MODAL & KLAIM ---
    const modal = document.getElementById('modalKlaim');
    const btnKlaim = document.getElementById('btnKlaim');
    const btnClose = document.getElementById('btnCloseModal');
    const formKlaim = document.getElementById('formKlaim');
    const inputFile = document.getElementById('klaimFoto');

    // Buka Modal
    btnKlaim.onclick = () => {
        if (!token) {
            Swal.fire({ icon: 'warning', title: 'Login Dulu', text: 'Anda harus login untuk mengajukan klaim.' })
                .then(() => window.location.href = 'daftar.html');
            return;
        }
        modal.classList.remove('hidden');
    };

    // Tutup Modal
    btnClose.onclick = () => modal.classList.add('hidden');

    // Tampilkan Nama File saat Upload
    inputFile.onchange = () => {
        if(inputFile.files[0]) document.getElementById('fileName').innerText = inputFile.files[0].name;
    };

    // SUBMIT FORM KLAIM
    formKlaim.onsubmit = async (e) => {
        e.preventDefault();

        // Loading State
        const submitBtn = formKlaim.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
        submitBtn.disabled = true;

        try {
            const formData = new FormData();
            formData.append('id_laporan', idLaporan);
            formData.append('deskripsi', document.getElementById('klaimDeskripsi').value);
            formData.append('kronologi', document.getElementById('klaimKronologi').value);
            formData.append('foto_bukti', inputFile.files[0]);

            const res = await fetch(KLAIM_URL, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: formData
            });

            const result = await res.json();

            if (res.ok) {
                modal.classList.add('hidden');
                Swal.fire('Berhasil!', 'Klaim Anda telah dikirim. Tunggu kabar selanjutnya.', 'success');
                formKlaim.reset();
            } else {
                throw new Error(result.message);
            }

        } catch (err) {
            Swal.fire('Gagal', err.message || 'Terjadi kesalahan', 'error');
        } finally {
            submitBtn.innerText = 'Kirim Pengajuan';
            submitBtn.disabled = false;
        }
    };
});