document.addEventListener('DOMContentLoaded', () => {
    
    let notifications = [];
    const token = localStorage.getItem('token_temucepat');
    const user = JSON.parse(localStorage.getItem('user_temucepat') || '{}');

    async function loadNotifications() {
        try {
            const res = await fetch('http://localhost:5000/api/notifikasi', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Gagal mengambil notifikasi');
            const json = await res.json();
            notifications = json.data.map(n => ({
                id: n.id_notifikasi,
                title: n.judul,
                message: n.pesan,
                type: n.tipe.toLowerCase(),
                date: new Date(n.created_at).toLocaleString('id-ID'),
                unread: !n.is_read,
                raw: n
            }));
            renderNotifications();
        } catch (err) {
            console.error('Load notifikasi error', err);
            notifications = [];
            renderNotifications();
        }
    }

    // Load at start
    if (token) loadNotifications();


    const notifList = document.getElementById('notifList');
    const emptyState = document.getElementById('emptyState');
    const markAllReadBtn = document.getElementById('markAllReadBtn');
    
    // Modal Elements
    const modal = document.getElementById('notifModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const modalDate = document.getElementById('modalDate');
    const modalType = document.getElementById('modalType');
    const closeModal = document.getElementById('closeModal');
    const modalCloseBtn = document.getElementById('modalCloseBtn');

    // === FUNCTION RENDER LIST ===
    function renderNotifications() {
        notifList.innerHTML = '';
        
        if (notifications.length === 0) {
            emptyState.style.display = 'block';
            return;
        } else {
            emptyState.style.display = 'none';
        }

        notifications.forEach(notif => {
            const isUnread = notif.unread ? 'unread' : '';
            
            // Tentukan Icon & Warna berdasarkan Type
            let iconClass = 'fa-info-circle';
            let typeClass = 'type-system';
            
            if (notif.type === 'match') {
                iconClass = 'fa-search-location';
                typeClass = 'type-match';
            } else if (notif.type === 'claim') {
                iconClass = 'fa-handshake';
                typeClass = 'type-claim';
            }

            const html = `
                <div class="notif-card ${isUnread}" onclick="openDetail(${notif.id})">
                    <div class="notif-icon-box ${typeClass}">
                        <i class="fas ${iconClass}"></i>
                    </div>
                    <div class="notif-content">
                        <div class="notif-header">
                            <span class="notif-title">${notif.title}</span>
                            <span class="notif-time">${notif.date}</span>
                        </div>
                        <p class="notif-desc">${notif.message}</p>
                    </div>
                    <button class="btn-delete" onclick="deleteNotif(event, ${notif.id})" title="Hapus Notifikasi">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </div>
            `;
            notifList.innerHTML += html;
        });
    }

    // === ACTIONS ===
    
    // 1. Buka Detail & Tandai Dibaca
    window.openDetail = async function(id) {
        const notif = notifications.find(n => n.id === id);
        if (!notif) return;

        // Tandai sebagai dibaca di server (simple workaround: re-fetch list after open)
        try {
            await fetch(`http://localhost:5000/api/notifikasi/mark-read`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id_notifikasi: notif.id })
            });
        } catch (err) {
            console.warn('Mark read failed', err);
        }

        // Re-load latest notifications so read status is updated
        await loadNotifications();

        // Re-find notif after reload to get full raw data
        const fresh = notifications.find(n => n.id === id);
        if (!fresh) return;

        // Isi Modal
        modalTitle.textContent = fresh.title;
        modalMessage.textContent = fresh.message;
        modalDate.innerHTML = `<i class="far fa-clock"></i> ${fresh.date}`;
        modalType.textContent = fresh.type.toUpperCase();

        // Jika tipe claim dan penerima adalah penemu, tampilkan tombol aksi
        const isClaim = fresh.type === 'claim';
        const actionArea = document.getElementById('modalActions');
        actionArea.innerHTML = '';
        if (isClaim) {
            const klaimId = fresh.raw.id_klaim;
            // Tombol Konfirmasi
            const btnConfirm = document.createElement('button');
            btnConfirm.className = 'btn btn-primary mr-2';
            btnConfirm.textContent = 'Konfirmasi & Kirim Nomor';
            btnConfirm.onclick = async function() {
                try {
                    const res = await fetch('http://localhost:5000/api/notifikasi/confirm-claim', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ id_klaim: klaimId })
                    });
                    const j = await res.json();
                    if (res.ok) {
                        Swal.fire({ icon: 'success', title: 'Berhasil', text: j.message });
                        closeModalFunc();
                        loadNotifications();
                    } else {
                        Swal.fire({ icon: 'error', title: 'Gagal', text: j.message || 'Terjadi kesalahan' });
                    }
                } catch (err) {
                    console.error(err);
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghubungi server.' });
                }
            };

            // Tombol Tolak
            const btnReject = document.createElement('button');
            btnReject.className = 'btn btn-danger';
            btnReject.textContent = 'Tolak Klaim';
            btnReject.onclick = async function() {
                const { isConfirmed } = await Swal.fire({ title: 'Tolak Klaim', text: 'Yakin menolak klaim ini?', icon: 'warning', showCancelButton: true, confirmButtonText: 'Ya, Tolak' });
                if (!isConfirmed) return;
                try {
                    const res = await fetch('http://localhost:5000/api/notifikasi/reject-claim', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                        body: JSON.stringify({ id_klaim: klaimId })
                    });
                    const j = await res.json();
                    if (res.ok) {
                        Swal.fire({ icon: 'success', title: 'Berhasil', text: j.message });
                        closeModalFunc();
                        loadNotifications();
                    } else {
                        Swal.fire({ icon: 'error', title: 'Gagal', text: j.message || 'Terjadi kesalahan' });
                    }
                } catch (err) {
                    console.error(err);
                    Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghubungi server.' });
                }
            };

            actionArea.appendChild(btnConfirm);
            actionArea.appendChild(btnReject);
        }

        // Set Lihat Barang Terkait button
        const modalActionBtn = document.getElementById('modalActionBtn');
        modalActionBtn.onclick = function() {
            if (fresh.raw && fresh.raw.id_laporan) {
                window.location.href = `detail.html?id=${fresh.raw.id_laporan}`;
            }
        };

        // Show Modal
        modal.classList.add('show');
    };

    // 2. Hapus Notifikasi
    window.deleteNotif = function(event, id) {
        event.stopPropagation(); // Agar tidak membuka modal saat tombol hapus diklik
        if(confirm("Hapus notifikasi ini?")) {
            notifications = notifications.filter(n => n.id !== id);
            renderNotifications();
        }
    };

    // 3. Tandai Semua Dibaca
    markAllReadBtn.addEventListener('click', async () => {
        try {
            const res = await fetch('http://localhost:5000/api/notifikasi/mark-all-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                Swal.fire({ icon: 'success', title: 'Sukses', text: 'Semua notifikasi ditandai sebagai dibaca' });
                loadNotifications();
            } else {
                const j = await res.json();
                Swal.fire({ icon: 'error', title: 'Gagal', text: j.message || 'Terjadi kesalahan' });
            }
        } catch (err) {
            console.error(err);
            Swal.fire({ icon: 'error', title: 'Error', text: 'Gagal menghubungi server.' });
        }
    });

    // 4. Tutup Modal
    function closeModalFunc() {
        modal.classList.remove('show');
    }

    closeModal.addEventListener('click', closeModalFunc);
    modalCloseBtn.addEventListener('click', closeModalFunc);
    
    // Klik di luar modal untuk menutup
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    // === INITIAL RENDER ===
    renderNotifications();
});