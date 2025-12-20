// assets/js/auth_check.js

document.addEventListener('DOMContentLoaded', function() {
    const token = localStorage.getItem('token_temucepat');

    if (!token) {
        // Kalau tidak ada token, langsung tendang
        alert('Anda belum login! Silakan login dulu.');
        window.location.href = 'login awal.html';
    }
});