document.addEventListener('DOMContentLoaded', async function() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  const API_BASE = 'http://localhost:5000/api/laporan';
  const claimApi = 'http://localhost:5000/api/klaim';

  const elLoading = document.getElementById('loading');
  const elContent = document.getElementById('content');
  const elNama = document.getElementById('namaBarang');
  const elFoto = document.getElementById('fotoBarang');
  const elDesc = document.getElementById('deskripsi');
  const elLokasi = document.getElementById('lokasi');
  const elTgl = document.getElementById('tgl');
  const elPelapor = document.getElementById('pelapor');
  const elStatus = document.getElementById('statusBadge');
  const claimBtn = document.getElementById('claimBtn');

  if (!id) {
    elLoading.textContent = 'ID laporan tidak ditemukan pada URL.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/${id}`);
    const json = await res.json();

    if (!res.ok) {
      elLoading.textContent = json.message || 'Gagal memuat laporan.';
      return;
    }

    const item = json.data;

    elNama.textContent = item.nama_barang || '—';
    elFoto.src = item.foto_barang ? `http://localhost:5000/${item.foto_barang}` : 'https://placehold.co/900x400?text=No+Image';
    elDesc.textContent = item.deskripsi || '-';
    elLokasi.textContent = item.lokasi_detail || '-';
    elTgl.textContent = item.tgl_kejadian ? new Date(item.tgl_kejadian).toLocaleDateString('id-ID') : '-';
    // Jangan tampilkan nama atau nomor HP pelapor untuk privasi
    elPelapor.textContent = 'Informasi pelapor disembunyikan untuk privasi.';
    elStatus.innerHTML = item.status === 'DIPUBLIKASIKAN' ? '<span class="status-found">DIPUBLIKASIKAN</span>' : `<span class="status-lost">${item.status}</span>`;

    elLoading.style.display = 'none';
    elContent.style.display = 'block';

    // If not published, disable claim button
    if (item.status !== 'DIPUBLIKASIKAN') {
      claimBtn.disabled = true;
      claimBtn.textContent = 'Tidak dapat diklaim';
      claimBtn.classList.add('disabled');
      return;
    }

    // If user already claimed this report, disable button
    const tokenLocal = localStorage.getItem('token_temucepat');
    if (tokenLocal) {
      try {
        const myClaimsRes = await fetch('http://localhost:5000/api/klaim/saya', {
          headers: { 'Authorization': `Bearer ${tokenLocal}` }
        });
        if (myClaimsRes.ok) {
          const myClaimsJson = await myClaimsRes.json();
          const existing = myClaimsJson.data.find(c => c.id_laporan === parseInt(id));
          if (existing) {
            claimBtn.disabled = true;
            claimBtn.textContent = 'Sudah Mengajukan Klaim';
            claimBtn.classList.add('disabled');
            return;
          }
        }
      } catch (err) {
        console.error('Cek klaim saya gagal', err);
      }
    }

    // Back button handler
    const backBtn = document.getElementById('backBtn');
    backBtn.addEventListener('click', function() {
      window.history.back();
    });

    // Inline Claim Form logic (show, preview, submit, cancel)
    const claimForm = document.getElementById('claimForm');
    const cfFile = document.getElementById('cf-file');
    const cfPreview = document.getElementById('cf-preview');
    const cfSubmit = document.getElementById('cf-submit');
    const cfCancel = document.getElementById('cf-cancel');

    claimBtn.addEventListener('click', function() {
      const token = localStorage.getItem('token_temucepat');
      if (!token) {
        Swal.fire({ icon: 'warning', title: 'Perlu Login', text: 'Silakan login untuk mengajukan klaim.' }).then(() => window.location.href = 'DAFTAR.html');
        return;
      }
      // Navigate to full-page claim form for a better UX
      window.location.href = `ajukan_klaim.html?id=${id}`;
    });

    // Preview selected file
    cfFile.addEventListener('change', function() {
      if (cfFile.files && cfFile.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
          cfPreview.src = e.target.result;
          cfPreview.style.display = 'block';
        };
        reader.readAsDataURL(cfFile.files[0]);
      } else {
        cfPreview.src = '';
        cfPreview.style.display = 'none';
      }
    });

    // Cancel claim form
    cfCancel.addEventListener('click', function() {
      claimForm.style.display = 'none';
      claimBtn.textContent = 'Klaim Barang Ini';
    });

    // Submit claim
    cfSubmit.addEventListener('click', async function() {
      const token = localStorage.getItem('token_temucepat');
      if (!token) { Swal.fire({ icon: 'warning', title: 'Perlu Login', text: 'Silakan login untuk mengajukan klaim.' }).then(() => window.location.href = 'DAFTAR.html'); return; }

      const bukti = document.getElementById('cf-bukti').value;
      const tgl = document.getElementById('cf-tgl').value;
      const krono = document.getElementById('cf-kronologi').value;

      if (!bukti || !tgl) {
        Swal.fire({ icon: 'warning', title: 'Form belum lengkap', text: 'Isi minimal deskripsi bukti dan tanggal kehilangan' });
        return;
      }

      try {
        const fd = new FormData();
        fd.append('id_laporan', parseInt(id));
        fd.append('bukti_kepemilikan', bukti);
        fd.append('tgl_hilang', tgl);
        fd.append('kronologi', krono || '');
        if (cfFile.files && cfFile.files[0]) fd.append('foto', cfFile.files[0]);

        const response = await fetch(claimApi, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` },
          body: fd
        });

        const body = await response.json();
        if (response.ok) {
          Swal.fire({ icon: 'success', title: 'Klaim Diajukan', text: body.message });
          claimForm.style.display = 'none';
          claimBtn.disabled = true;
          claimBtn.textContent = 'Telah Diklaim';
        } else {
          Swal.fire({ icon: 'error', title: 'Gagal', text: body.message || 'Terjadi kesalahan' });
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem('token_temucepat');
            localStorage.removeItem('user_temucepat');
            window.location.href = 'DAFTAR.html';
          }
        }

      } catch (err) {
        console.error(err);
        Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghubungi server.' });
      }
    });

  } catch (error) {
    console.error(error);
    elLoading.textContent = 'Terjadi kesalahan saat memuat data.';
  }
});