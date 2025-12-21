/*
Simple integration script to test klaim creation and that a notification is generated.
Usage:
  set TOKEN=... & set LAPORAN_ID=1 & node scripts/test_klaim_flow.js   (Windows)
  TOKEN=... LAPORAN_ID=1 node scripts/test_klaim_flow.js              (Unix)

Notes:
- This script performs JSON POST (no file upload). Backend accepts fields without a file.
- Ensure server is running (npm run dev) and TOKEN belongs to a regular user (not the penemu).
*/

const fetch = global.fetch || require('node-fetch');

const API_BASE = process.env.API_BASE || 'http://localhost:5000';
const TOKEN = process.env.TOKEN;
const LAPORAN_ID = process.env.LAPORAN_ID;

if (!TOKEN || !LAPORAN_ID) {
  console.error('Please set TOKEN and LAPORAN_ID environment variables.');
  process.exit(1);
}

(async () => {
  try {
    console.log('1) GET laporan', LAPORAN_ID);
    let res = await fetch(`${API_BASE}/api/laporan/${LAPORAN_ID}`, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
    const dataLap = await res.json();
    if (!res.ok) { console.error('GET laporan failed', dataLap); process.exit(1); }
    console.log('Laporan loaded:', { id_laporan: dataLap.data.id_laporan, id_pelapor: dataLap.data.id_pelapor });

    // 2) POST klaim (JSON) - no file in this test
    const payload = {
      id_laporan: dataLap.data.id_laporan,
      id_pelapor_penemu: dataLap.data.id_pelapor,
      deskripsi: 'Integration test klaim - jangan jawab'
    };

    console.log('2) POST klaim', payload);
    res = await fetch(`${API_BASE}/api/klaim/ajukan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${TOKEN}` },
      body: JSON.stringify(payload)
    });
    const resBody = await res.json();
    console.log('POST klaim response', res.status, resBody);

    if (!res.ok) process.exit(1);

    // 3) GET my notifikasi and show latest
    console.log('3) GET notifikasi saya');
    res = await fetch(`${API_BASE}/api/notifikasi`, { headers: { 'Authorization': `Bearer ${TOKEN}` } });
    const notifs = await res.json();
    if (!res.ok) { console.error('GET notifikasi failed', notifs); process.exit(1); }

    console.log('Notifikasi count:', notifs.data.length);
    console.log('Latest notifikasi (first 5):', notifs.data.slice(0,5).map(n => ({ id: n.id_notifikasi, judul: n.judul, pesan: n.pesan, tipe: n.tipe })));

    console.log('Integration test finished.');
  } catch (err) {
    console.error('Test failed', err);
    process.exit(1);
  }
})();