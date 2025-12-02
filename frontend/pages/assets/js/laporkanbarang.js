document.addEventListener('DOMContentLoaded', () => {
    const btnDitemukan = document.getElementById('btnDitemukan');
    const btnHilang = document.getElementById('btnHilang');
    const submitBtn = document.getElementById('submitBtn');
    const itemPhotoInput = document.getElementById('itemPhoto');
    const fileNameSpan = document.getElementById('fileName');
    const photoPreview = document.getElementById('photoPreview');
    let currentStatus = 'Ditemukan'; // Default status

    // Handle status toggle buttons
    btnDitemukan.addEventListener('click', () => {
        btnDitemukan.classList.add('active');
        btnHilang.classList.remove('active');
        currentStatus = 'Ditemukan';
        submitBtn.textContent = 'Kirim Data Ditemukan';
    });

    btnHilang.addEventListener('click', () => {
        btnHilang.classList.add('active');
        btnDitemukan.classList.remove('active');
        currentStatus = 'Hilang';
        submitBtn.textContent = 'Kirim Data Kehilangan';
    });

    // Handle file input change for displaying file name and preview
    itemPhotoInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            fileNameSpan.textContent = file.name;
            photoPreview.src = URL.createObjectURL(file);
            photoPreview.style.display = 'block';
        } else {
            fileNameSpan.textContent = 'Pilih File...';
            photoPreview.src = '';
            photoPreview.style.display = 'none';
        }
    });

    // Form submission (simulasi)
    const barangForm = document.getElementById('barangForm');
    barangForm.addEventListener('submit', (event) => {
        event.preventDefault();
        
        // Mendapatkan nilai Jenis Barang
        const selectedItemType = document.getElementById('itemType').value;

        if (!selectedItemType) {
            alert('Mohon pilih Jenis Barang terlebih dahulu!');
            return;
        }

        alert(`${currentStatus === 'Ditemukan' ? 'Data Barang Ditemukan' : 'Data Barang Kehilangan'} berhasil dikirim untuk barang jenis: ${selectedItemType}! (Simulasi)`);

        // Reset form
        barangForm.reset();
        fileNameSpan.textContent = 'Pilih File...';
        photoPreview.src = '';
        photoPreview.style.display = 'none';
        btnDitemukan.classList.add('active');
        btnHilang.classList.remove('active');
        currentStatus = 'Ditemukan';
        submitBtn.textContent = 'Kirim Data Ditemukan';
    });
});
