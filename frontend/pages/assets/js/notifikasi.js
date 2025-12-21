document.addEventListener('DOMContentLoaded', () => {
    
    // === DATA SIMULASI (Dummy Data) ===
    let notifications = [
        {
            id: 1,
            title: "Barang Cocok Ditemukan!",
            message: "Sistem menemukan barang yang mungkin milik Anda: 'Kunci Motor Yamaha' di Gedung G. Cek sekarang!",
            type: "match", // match, system, claim
            date: "Baru saja",
            unread: true
        },
        {
            id: 2,
            title: "Klaim Disetujui",
            message: "Selamat! Klaim Anda untuk 'Dompet Coklat' telah disetujui oleh penemu. Silakan hubungi nomor WA penemu.",
            type: "claim",
            date: "2 Jam lalu",
            unread: true
        },
        {
            id: 3,
            title: "Update Sistem",
            message: "Kami telah memperbarui kebijakan privasi aplikasi TemuCepat. Silakan baca di pengaturan.",
            type: "system",
            date: "Kemarin",
            unread: false
        }
    ];

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
    window.openDetail = function(id) {
        const notif = notifications.find(n => n.id === id);
        if (!notif) return;

        // Tandai sebagai dibaca di data
        notif.unread = false;
        renderNotifications(); // Re-render untuk hilangkan tanda merah

        // Isi Modal
        modalTitle.textContent = notif.title;
        modalMessage.textContent = notif.message;
        modalDate.innerHTML = `<i class="far fa-clock"></i> ${notif.date}`;
        modalType.textContent = notif.type.toUpperCase();
        
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
    markAllReadBtn.addEventListener('click', () => {
        notifications.forEach(n => n.unread = false);
        renderNotifications();
        alert("Semua notifikasi telah ditandai sebagai dibaca.");
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