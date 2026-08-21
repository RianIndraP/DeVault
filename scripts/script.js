async function gantiHalaman(halaman) {
    const app = document.getElementById("app");
    try {
        const res = await fetch(halaman);

        if (!res.ok) {
            throw new Error(`Gagal memuat halaman: ${res.statusText}`);
        }

        const htmlContent = await res.text();

        app.innerHTML = htmlContent;

        // Setelah konten baru dimasukkan, cek dan inisialisasi fitur halaman (misal captcha)
        initCaptchaIfExists();
    } catch (error) {
        console.error(error);
        app.innerHTML = `<p style="color: red; text-align: center;">Error: Gagal memuat halaman</p>`;
    }
}

// ====== CURSOR GLOW (jalan global, tidak perlu di-reinit tiap ganti halaman) ======
document.addEventListener('mousemove', (e) => {
    const glow = document.getElementById('cursor-grid');
    if (glow) {
        glow.style.setProperty('--x', e.clientX + 'px');
        glow.style.setProperty('--y', e.clientY + 'px');
    }
});

// ====== CAPTCHA LOGIC ======
function initCaptchaIfExists() {
    const canvas = document.getElementById('captchaCanvas');
    if (!canvas) return; // halaman ini tidak punya captcha, skip

    const ctx = canvas.getContext('2d');
    const refreshBtn = document.getElementById('refreshCaptcha');
    const captchaInput = document.getElementById('captchaInput');
    const captchaError = document.getElementById('captchaError');
    const loginForm = document.getElementById('loginForm');

    let currentCaptcha = '';

    function generateCaptchaText() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let text = '';
        for (let i = 0; i < 5; i++) {
            text += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return text;
    }

    function drawCaptcha() {
        currentCaptcha = generateCaptchaText();

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle = `rgba(56,189,248,${Math.random() * 0.3 + 0.1})`;
            ctx.beginPath();
            ctx.moveTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.lineTo(Math.random() * canvas.width, Math.random() * canvas.height);
            ctx.stroke();
        }

        for (let i = 0; i < 40; i++) {
            ctx.fillStyle = `rgba(148,163,184,${Math.random() * 0.4})`;
            ctx.fillRect(Math.random() * canvas.width, Math.random() * canvas.height, 1.5, 1.5);
        }

        const charWidth = canvas.width / currentCaptcha.length;
        for (let i = 0; i < currentCaptcha.length; i++) {
            ctx.save();
            const x = charWidth * i + charWidth / 2;
            const y = canvas.height / 2;
            ctx.translate(x, y);
            ctx.rotate((Math.random() - 0.5) * 0.4);
            ctx.font = 'bold 22px monospace';
            ctx.fillStyle = '#7dd3fc';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(currentCaptcha[i], 0, 0);
            ctx.restore();
        }

        captchaInput.value = '';
        captchaError.classList.add('hidden');
    }

    refreshBtn.addEventListener('click', drawCaptcha);

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const inputVal = captchaInput.value.trim().toUpperCase();

        if (inputVal !== currentCaptcha) {
            captchaError.classList.remove('hidden');
            drawCaptcha();
            return;
        }

        captchaError.classList.add('hidden');
        console.log('Captcha valid, lanjutkan proses login...');
    });

    drawCaptcha();
}

// Memuat halaman login secara otomatis saat pertama kali memulai halaman
document.addEventListener("DOMContentLoaded", () => {
    gantiHalaman('/pages/auth/login.html');
});