async function gantiHalaman(halaman) {
    const app = document.getElementById("app");
    try {
        const res = await fetch(halaman);

        if (!res.ok) {
            throw new Error(`Gagal memuat halaman: ${res.statusText}`);
        }

        const htmlContent = await res.text();

        app.innerHTML = htmlContent;

        // Setelah konten baru dimasukkan, cek dan inisialisasi fitur halaman
        initCaptchaIfExists();
        initLegalModalsIfExists();
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

document.addEventListener("click", (e) => {
    const link = e.target.closest("[data-page]");

    if (!link) return;
    e.preventDefault();
    const halaman = link.dataset.page;
    gantiHalaman(halaman);
})

// ====== CAPTCHA LOGIC ======
function initCaptchaIfExists() {

    const canvas = document.getElementById("captchaCanvas");

    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const refreshBtn = document.getElementById("refreshCaptcha");
    const captchaInput = document.getElementById("captchaInput");
    const captchaError = document.getElementById("captchaError");

    const form = canvas.closest("form");

    if (!form || !refreshBtn || !captchaInput || !captchaError) {
        console.warn("Elemen CAPTCHA tidak lengkap.");
        return;
    }

    let currentCaptcha = "";

    function generateCaptchaText() {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let text = "";
        for (let i = 0; i < 5; i++) {
            text += chars.charAt(
                Math.floor(Math.random() * chars.length)
            );
        }
        return text;
    }

    function drawCaptcha() {
        currentCaptcha = generateCaptchaText();
        ctx.clearRect(
            0,
            0,
            canvas.width,
            canvas.height
        );
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(
            0,
            0,
            canvas.width,
            canvas.height
        );

        // Garis
        for (let i = 0; i < 5; i++) {
            ctx.strokeStyle =
                `rgba(56,189,248,${Math.random() * 0.3 + 0.1})`;
            ctx.beginPath();
            ctx.moveTo(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            );
            ctx.lineTo(
                Math.random() * canvas.width,
                Math.random() * canvas.height
            );
            ctx.stroke();
        }

        // Noise
        for (let i = 0; i < 40; i++) {
            ctx.fillStyle =
                `rgba(148,163,184,${Math.random() * 0.4})`;
            ctx.fillRect(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                1.5,
                1.5
            );
        }

        // Karakter
        const charWidth = canvas.width / currentCaptcha.length;

        for (let i = 0; i < currentCaptcha.length; i++) {
            ctx.save();
            const x = charWidth * i + charWidth / 2;
            const y = canvas.height / 2;
            ctx.translate(x, y);
            ctx.rotate(
                (Math.random() - 0.5) * 0.4
            );
            ctx.font = "bold 22px monospace";
            ctx.fillStyle = "#7dd3fc";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(
                currentCaptcha[i],
                0,
                0
            );
            ctx.restore();
        }
        captchaInput.value = "";
        captchaError.classList.add("hidden");
    }

    refreshBtn.addEventListener(
        "click",
        drawCaptcha
    );

    form.addEventListener("submit", function (e) {
        e.preventDefault();
        const inputVal = captchaInput.value.trim().toUpperCase();

        if (inputVal !== currentCaptcha) {
            captchaError.classList.remove("hidden");
            drawCaptcha();
            return;
        }
        captchaError.classList.add("hidden");
        console.log("Captcha valid.");
    });
    drawCaptcha();
}

// ====== LEGAL MODALS LOGIC (SYARAT & KETENTUAN, KEBIJAKAN PRIVASI) ======
function initLegalModalsIfExists() {
    const btnTerms = document.getElementById("btnTerms");
    const btnPrivacy = document.getElementById("btnPrivacy");
    const modalTerms = document.getElementById("modalTerms");
    const modalPrivacy = document.getElementById("modalPrivacy");
    const closeTerms = document.getElementById("closeTerms");
    const closePrivacy = document.getElementById("closePrivacy");
    const acceptTerms = document.getElementById("acceptTerms");
    const acceptPrivacy = document.getElementById("acceptPrivacy");
    const termsCheckbox = document.getElementById("terms");

    if (btnTerms && modalTerms) {
        btnTerms.addEventListener("click", (e) => {
            e.preventDefault();     
            modalTerms.classList.remove("hidden");
        });
        if (closeTerms) {
            closeTerms.addEventListener("click", () => modalTerms.classList.add("hidden"));
        }
        if (acceptTerms) {
            acceptTerms.addEventListener("click", () => {
                modalTerms.classList.add("hidden");
                if (termsCheckbox) termsCheckbox.checked = true;
            });
        }
        modalTerms.addEventListener("click", (e) => {
            if (e.target === modalTerms) modalTerms.classList.add("hidden");
        });
    }

    if (btnPrivacy && modalPrivacy) {
        btnPrivacy.addEventListener("click", (e) => {
            e.preventDefault();
            modalPrivacy.classList.remove("hidden");
        });
        if (closePrivacy) {
            closePrivacy.addEventListener("click", () => modalPrivacy.classList.add("hidden"));
        }
        if (acceptPrivacy) {
            acceptPrivacy.addEventListener("click", () => {
                modalPrivacy.classList.add("hidden");
            });
        }
        modalPrivacy.addEventListener("click", (e) => {
            if (e.target === modalPrivacy) modalPrivacy.classList.add("hidden");
        });
    }
}

// Memuat halaman login secara otomatis saat pertama kali memulai halaman
document.addEventListener("DOMContentLoaded", () => {
    gantiHalaman('/pages/auth/login.html');
});
