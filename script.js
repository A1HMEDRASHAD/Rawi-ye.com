/* =========================================================
   1. دورة الزمن التلقائية السلسة (شروق ⬅ نهار ⬅ غروب ⬅ ليل)
   ========================================================= */
const phases = ['dawn', 'day', 'sunset', 'night'];
let phaseIdx = 1; // البداية: النهار الصيفي المشرق
let phaseTimer = null;

function applyTimePhase(index) {
    phaseIdx = index % phases.length;
    document.body.setAttribute('data-phase', phases[phaseIdx]);
}

function advanceTimePhase() {
    applyTimePhase(phaseIdx + 1);
    resetAutoTimer();
}

function resetAutoTimer() {
    if (phaseTimer) clearInterval(phaseTimer);
    phaseTimer = setInterval(() => {
        applyTimePhase(phaseIdx + 1);
    }, 5500); // يتبدل المشهد تلقائياً كل 5.5 ثوانٍ
}

// تشغيل الدورة التلقائية فور تحميل الصفحة
resetAutoTimer();


/* =========================================================
   2. محرك الرسوم الحية (Canvas): نجوم، شهب، سحب، طيور، يراعات
   ========================================================= */
const canvas = document.getElementById('worldCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
let width = window.innerWidth;
let height = window.innerHeight;

function resizeCanvas() {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

// أ. مصفوفة النجوم المتلألئة
const stars = Array.from({ length: 70 }, () => ({
    x: Math.random(),
    y: Math.random() * 0.60,
    r: Math.random() * 1.8 + 0.6,
    alpha: Math.random() * Math.PI * 2,
    speed: Math.random() * 0.025 + 0.008
}));

// ب. الشهب الليلية العابرة
const shootingStar = {
    active: false,
    x: 0,
    y: 0,
    len: 0,
    speed: 0,
    alpha: 0
};

function triggerShootingStar() {
    shootingStar.active = true;
    shootingStar.x = (0.2 + Math.random() * 0.6) * width;
    shootingStar.y = (0.05 + Math.random() * 0.25) * height;
    shootingStar.len = 65 + Math.random() * 45;
    shootingStar.speed = 9 + Math.random() * 5;
    shootingStar.alpha = 1;
}

// ج. السحب الكرتونية الناعمة
const clouds = [
    { x: 0.12, y: 0.12, scale: 0.85, speed: 0.00025 },
    { x: 0.55, y: 0.22, scale: 0.65, speed: 0.00018 },
    { x: 0.85, y: 0.08, scale: 0.95, speed: 0.00022 }
];

// د. أسراب الطيور المحلقة
const birds = Array.from({ length: 5 }, (_, i) => ({
    x: -0.1 - i * 0.045,
    y: 0.15 + (i % 3) * 0.028,
    wing: i * 1.1,
    speedX: 0.00075
}));

// هـ. ومضات الوديان اليمنية المضيئة في المساء (Fireflies)
const fireflies = Array.from({ length: 20 }, () => ({
    x: Math.random(),
    y: 0.62 + Math.random() * 0.32,
    r: Math.random() * 2.2 + 1,
    phase: Math.random() * Math.PI * 2,
    speedY: Math.random() * 0.00045 + 0.0002
}));

function drawCloud(cx, cy, scale, alpha) {
    if (!ctx) return;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(scale, scale);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(0, 0, 24, 0, Math.PI * 2);
    ctx.arc(22, -8, 28, 0, Math.PI * 2);
    ctx.arc(48, -2, 22, 0, Math.PI * 2);
    ctx.arc(24, 8, 24, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
}

function animateWorld() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    const currentPhase = document.body.getAttribute('data-phase') || 'day';

    // 1. رسم النجوم والشهب في الليل والغروب والشروق
    if (currentPhase === 'night' || currentPhase === 'sunset' || currentPhase === 'dawn') {
        const starVis = currentPhase === 'night' ? 1 : 0.35;
        stars.forEach(s => {
            s.alpha += s.speed;
            const a = (Math.sin(s.alpha) * 0.4 + 0.6) * starVis;
            ctx.fillStyle = `rgba(255, 255, 240, ${a})`;
            ctx.beginPath();
            ctx.arc(s.x * width, s.y * height, s.r, 0, Math.PI * 2);
            ctx.fill();
        });

        // إطلاق شهاب ليلي بشكل عشوائي هادئ
        if (currentPhase === 'night' && !shootingStar.active && Math.random() < 0.008) {
            triggerShootingStar();
        }

        if (shootingStar.active) {
            ctx.save();
            ctx.strokeStyle = `rgba(254, 240, 138, ${shootingStar.alpha})`;
            ctx.lineWidth = 2;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(shootingStar.x, shootingStar.y);
            ctx.lineTo(shootingStar.x - shootingStar.len, shootingStar.y + shootingStar.len * 0.45);
            ctx.stroke();
            ctx.restore();

            shootingStar.x += shootingStar.speed;
            shootingStar.y -= shootingStar.speed * 0.45;
            shootingStar.alpha -= 0.025;
            if (shootingStar.alpha <= 0) shootingStar.active = false;
        }
    }

    // 2. رسم السحب الكرتونية
    const cloudAlpha = currentPhase === 'night' ? 0.14 : (currentPhase === 'day' ? 0.82 : 0.55);
    clouds.forEach(c => {
        c.x += c.speed;
        if (c.x > 1.2) c.x = -0.25;
        drawCloud(c.x * width, c.y * height, c.scale, cloudAlpha);
    });

    // 3. رسم الطيور المتحركة في النهار والشروق والغروب
    if (currentPhase !== 'night') {
        ctx.strokeStyle = currentPhase === 'sunset' ? 'rgba(255, 240, 220, 0.85)' : 'rgba(15, 23, 42, 0.65)';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        birds.forEach(b => {
            b.x += b.speedX;
            b.wing += 0.12;
            if (b.x > 1.15) b.x = -0.15;
            const bx = b.x * width;
            const by = b.y * height + Math.sin(b.wing * 0.5) * 4;
            const wingY = Math.sin(b.wing) * 6;

            ctx.beginPath();
            ctx.moveTo(bx - 8, by - wingY);
            ctx.quadraticCurveTo(bx - 4, by - 4, bx, by);
            ctx.quadraticCurveTo(bx + 4, by - 4, bx + 8, by - wingY);
            ctx.stroke();
        });
    }

    // 4. رسم الومضات الذهبية الصاعدة من البيوت والوديان في الغروب والليل
    if (currentPhase === 'night' || currentPhase === 'sunset') {
        fireflies.forEach(f => {
            f.y -= f.speedY;
            f.phase += 0.06;
            if (f.y < 0.52) f.y = 0.94;
            const fx = (f.x + Math.sin(f.phase) * 0.01) * width;
            const fy = f.y * height;
            const glow = (Math.sin(f.phase) * 0.5 + 0.5) * 0.88;

            ctx.fillStyle = `rgba(253, 224, 71, ${glow})`;
            ctx.beginPath();
            ctx.arc(fx, fy, f.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }

    requestAnimationFrame(animateWorld);
}

animateWorld();


/* =========================================================
   3. تأثير العمق التفاعلي (Parallax) للجبال والبيوت اليمنية
   ========================================================= */
const panorama = document.getElementById('yemenPanorama');

window.addEventListener('mousemove', (e) => {
    if (!panorama) return;
    const moveX = (e.clientX / window.innerWidth - 0.5) * 14;
    panorama.style.transform = `translateX(${moveX}px)`;
});

window.addEventListener('touchmove', (e) => {
    if (!panorama || !e.touches[0]) return;
    const moveX = (e.touches[0].clientX / window.innerWidth - 0.5) * 10;
    panorama.style.transform = `translateX(${moveX}px)`;
}, { passive: true });


/* =========================================================
   4. إدارة النوافذ الزجاجية المنبثقة للمشاريع (Modals)
   ========================================================= */
function openModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('open');
}

function closeModal(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('open');
}

function closeOnBackdrop(event, id) {
    if (event.target && event.target.id === id) {
        closeModal(id);
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        document.querySelectorAll('.modal-backdrop.open').forEach(modal => {
            modal.classList.remove('open');
        });
    }
});

// ربط الدوال بـ window لضمان عمل أزرار HTML في جميع المتصفحات
window.advanceTimePhase = advanceTimePhase;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeOnBackdrop = closeOnBackdrop;
