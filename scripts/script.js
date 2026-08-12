async function SwitchPage(filePath) {
    const app = document.getElementById("app");

    try {
        const res = await fetch(filePath);

        // Cek jika file tidak ditemukan
        if(!res.ok) {
            throw new Error(`Gagal memuat file: ${res.statusText}`);
        }

        // Ubah respon menjadi text html
        const htmlContent = await res.text();

        // Masukkan teks HTML ke dalam elemen wadah
        app.innerHTML = htmlContent;

    } catch (error) {
        console.error(error);
        app.innerHTML = `<p style="color: red; text-align: center;">Error: Gagal memuat halaman</p>`
        
    }
}

// Memuat halaman 'dashboard.html' secara otomatis saat pertama kali memulai halaman
document.addEventListener('DOMContentLoaded', () => {
    SwitchPage('pages/dashboard.html');
});

document.addEventListener('mousemove', (e) => {
    const glow = document.getElementById('cursor-grid');
    if (glow) {
        glow.style.setProperty('--x', e.clientX + 'px');
        glow.style.setProperty('--y', e.clientY + 'px');
    }
});