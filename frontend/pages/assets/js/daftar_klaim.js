document.addEventListener('DOMContentLoaded', function() {
  const API = 'http://localhost:5000/api/klaim/masuk';
  const confirmApi = 'http://localhost:5000/api/notifikasi/confirm-claim';
  const rejectApi = 'http://localhost:5000/api/notifikasi/reject-claim';
  const token = localStorage.getItem('token_temucepat');

  const container = document.getElementById('claimsContainer');
  const emptyState = document.getElementById('emptyState');
  const refreshBtn = document.getElementById('refreshBtn');

  async function load() {
    if (!token) {
      Swal.fire({ icon: 'warning', title: 'Perlu Login', text: 'Silakan login sebagai penemu untuk melihat klaim.' }).then(() => window.location.href = 'DAFTAR.html');
      return;
    }

    try {
      const res = await fetch(API, { headers: { 'Authorization': `Bearer ${token}` } });
      if (!res.ok) throw new Error('Gagal ambil klaim');
      const json = await res.json();
      render(json.data);
    } catch (err) {
      console.error('Load klaim error', err);
      container.innerHTML = '<p style="color:red;">Gagal mengambil klaim. Cek koneksi.</p>';
    }
  }

  function render(items) {
    container.innerHTML = '';
    if (!items || items.length === 0) {
      emptyState.style.display = 'block';
      return;
    }
    emptyState.style.display = 'none';

    items.forEach(k => {
      const card = document.createElement('div');
      card.className = 'claim-card';
      card.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
      card.style.padding = '16px';
      card.style.borderRadius = '12px';
      card.style.background = '#fff';

      const img = document.createElement('img');
      img.src = k.foto_bukti ? `http://localhost:5000/${k.foto_bukti}` : 'https://placehold.co/600x300?text=No+Image';
      img.style.width = '100%';
      img.style.height = '160px';
      img.style.objectFit = 'cover';
      img.style.borderRadius = '8px';

      const title = document.createElement('h3');
      title.textContent = `Laporan #${k.id_laporan} — ${k.status}`;
      title.style.margin = '12px 0 6px';

      const desc = document.createElement('p');
      desc.textContent = k.bukti_kepemilikan.length > 200 ? k.bukti_kepemilikan.slice(0,200) + '...' : k.bukti_kepemilikan;
      desc.style.color = '#444';

      const meta = document.createElement('div');
      meta.style.display = 'flex';
      meta.style.justifyContent = 'space-between';
      meta.style.marginTop = '12px';

      const date = document.createElement('div');
      date.style.color = '#888';
      date.style.fontSize = '13px';
      date.textContent = k.created_at ? new Date(k.created_at).toLocaleString('id-ID') : '';

      const actions = document.createElement('div');

      const btnConfirm = document.createElement('button');
      btnConfirm.className = 'btn btn-primary';
      btnConfirm.textContent = 'Konfirmasi & Kirim Nomor';
      btnConfirm.style.marginRight = '8px';
      btnConfirm.onclick = async function() {
        const { isConfirmed } = await Swal.fire({ title: 'Konfirmasi Klaim', text: 'Kirim nomor Anda ke pemilik klaim?', icon: 'question', showCancelButton: true });
        if (!isConfirmed) return;
        try {
          const res = await fetch(confirmApi, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ id_klaim: k.id_klaim }) });
          const j = await res.json();
          if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Terkirim', text: j.message });
            load();
          } else {
            Swal.fire({ icon: 'error', title: 'Gagal', text: j.message || 'Terjadi kesalahan' });
          }
        } catch (err) {
          console.error(err);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghubungi server.' });
        }
      };

      const btnReject = document.createElement('button');
      btnReject.className = 'btn btn-danger';
      btnReject.textContent = 'Tolak Klaim';
      btnReject.onclick = async function() {
        const { isConfirmed } = await Swal.fire({ title: 'Tolak Klaim', text: 'Yakin ingin menolak klaim ini?', icon: 'warning', showCancelButton: true });
        if (!isConfirmed) return;
        try {
          const res = await fetch(rejectApi, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ id_klaim: k.id_klaim }) });
          const j = await res.json();
          if (res.ok) {
            Swal.fire({ icon: 'success', title: 'Berhasil', text: j.message });
            load();
          } else {
            Swal.fire({ icon: 'error', title: 'Gagal', text: j.message || 'Terjadi kesalahan' });
          }
        } catch (err) {
          console.error(err);
          Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghubungi server.' });
        }
      };

      actions.appendChild(btnConfirm);
      actions.appendChild(btnReject);

      meta.appendChild(date);
      meta.appendChild(actions);

      card.appendChild(img);
      card.appendChild(title);
      card.appendChild(desc);
      card.appendChild(meta);

      container.appendChild(card);
    });
  }

  refreshBtn.addEventListener('click', load);

  // Initial
  load();
});