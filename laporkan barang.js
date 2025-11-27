<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar Barang Ditemukan/Hilang</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --primary-color: #2f2cde; /* Biru terang untuk aksen */
            --card-background: rgba(255, 255, 255, 0.8); /* Kartu semi-transparan */
            --text-dark: #333;
            --text-light: #fff;
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            font-family: 'Poppins', sans-serif;
        }

        body {
            /* LATAR BELAKANG BARU (menggunakan gambar yang Anda berikan) */
            background-image: url('data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAIBAQEBAQIBAQECAgICAgQDAgICAgUEBAMEBgUGBgYFBgYGBgcHBwcHBwgHBwcICAgJCQkJCQsLCwsLCwsLCwsLCwADAwMDAwQEBAQEBQEBAQECAgICAgMDAwMDAwQEBAQEBgYGBgYGBgcHBwcHBwgHBwcICAgJCQkJCQsLCwsLCwsLCwsLCwD/wAARCABWAFYDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAgP/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxO5wD5qAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA');
            background-size: cover;
            background-position: center;
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .card {
            background-color: var(--card-background); /* Menggunakan semi-transparan agar latar belakang terlihat */
            padding: 40px;
            border-radius: 15px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
            width: 100%;
            max-width: 550px;
            backdrop-filter: blur(5px); /* Efek blur ringan pada kartu */
            border: 1px solid rgba(255, 255, 255, 0.3); /* Sedikit border */
        }

        h1 {
            color: var(--primary-color);
            text-align: center;
            margin-bottom: 30px;
            font-size: 2em;
        }

        label {
            display: block;
            margin-bottom: 5px;
            font-weight: 600;
            color: var(--text-dark);
        }

        input[type="text"],
        input[type="file"],
        select,
        textarea {
            width: 100%;
            padding: 12px;
            margin-bottom: 20px;
            border: 1px solid #ccc;
            border-radius: 8px;
            font-size: 1em;
            transition: border-color 0.3s;
        }
        
        input[type="file"] {
            padding: 10px;
        }

        input[type="text"]:focus,
        select:focus,
        textarea:focus {
            border-color: var(--primary-color);
            outline: none;
        }

        textarea {
            resize: vertical;
            min-height: 100px;
        }

        .form-group {
            margin-bottom: 20px;
        }

        #photoPreview {
            display: none;
            width: 100%;
            max-height: 250px;
            object-fit: contain;
            border-radius: 8px;
            margin-top: 10px;
            margin-bottom: 20px;
            border: 1px dashed #ccc;
            padding: 10px;
        }

        button {
            background-color: var(--primary-color);
            color: var(--text-light);
            padding: 15px 25px;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-size: 1.1em;
            font-weight: 600;
            width: 100%;
            transition: background-color 0.3s;
        }

        button:hover {
            background-color: #2125b0;
        }
        
        #statusMessage {
            margin-top: 20px;
            padding: 10px;
            border-radius: 5px;
            text-align: center;
            font-weight: 600;
            display: none;
        }
        
    </style>
</head>
<body>
    <div class="card">
        <h1>Daftarkan Barang</h1>
        <p id="statusMessage"></p>
        <form id="barangForm">
            
            <div class="form-group">
                <label for="itemType">Status Barang:</label>
                <select id="itemType" required>
                    <option value="" disabled selected>Pilih Status</option>
                    <option value="Ditemukan">Ditemukan</option>
                    <option value="Hilang">Hilang</option>
                </select>
            </div>

            <div class="form-group">
                <label for="itemName">Nama Barang:</label>
                <input type="text" id="itemName" placeholder="Contoh: Dompet Kulit Coklat" required>
            </div>
            
            <div class="form-group">
                <label for="itemDescription">Ciri-ciri & Detail:</label>
                <textarea id="itemDescription" placeholder="Jelaskan merek, warna, lokasi penemuan/kehilangan, dan detail unik lainnya." required></textarea>
            </div>
            
            <div class="form-group">
                <label for="itemPhoto">Unggah Foto Barang:</label>
                <input type="file" id="itemPhoto" accept="image/*" required>
                <img id="photoPreview" src="" alt="Photo Preview">
            </div>
            
            <button type="submit">Kirim Data Barang</button>
        </form>
    </div>
</body>
</html>