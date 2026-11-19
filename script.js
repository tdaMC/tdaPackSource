// ========================================================
// 1. CANVAS HẮC KHÍ VỰC THẲM (ABYSSAL VOID & CURSED ASH)
// ========================================================
const canvas = document.getElementById('voidCanvas');
const ctx = canvas.getContext('2d');

let width = (canvas.width = window.innerWidth);
let height = (canvas.height = window.innerHeight);

window.addEventListener('resize', () => {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
});

const pointer = {
  x: null,
  y: null,
  prevX: null,
  prevY: null,
  active: false
};

// Vòng ấn chú bám theo chuột mượt mà
const sigil = {
  x: width / 2,
  y: height / 2,
  initialized: false,
  angle: 0,
  alpha: 0
};

const smokes = [];
const shockwaves = [];
const voidCracks = [];

window.addEventListener('mousemove', (e) => {
  pointer.prevX = pointer.x ?? e.clientX;
  pointer.prevY = pointer.y ?? e.clientY;
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.active = true;

  if (!sigil.initialized) {
    sigil.x = e.clientX;
    sigil.y = e.clientY;
    sigil.initialized = true;
  }

  // Tạo dải khói hắc ám khi di chuyển chuột
  const dx = pointer.x - pointer.prevX;
  const dy = pointer.y - pointer.prevY;
  const speed = Math.hypot(dx, dy);

  if (speed > 3) {
    const count = Math.min(3, Math.floor(speed / 12) + 1);
    for (let i = 0; i < count; i++) {
      smokes.push({
        x: pointer.x + (Math.random() - 0.5) * 14,
        y: pointer.y + (Math.random() - 0.5) * 14,
        vx: -dx * 0.04 + (Math.random() - 0.5) * 0.6,
        vy: -dy * 0.04 - Math.random() * 0.7 - 0.2,
        radius: Math.random() * 12 + 8,
        maxRadius: Math.random() * 26 + 24,
        alpha: 0.26,
        isCrimson: Math.random() < 0.32
      });
    }
  }
});

window.addEventListener('mouseleave', () => {
  pointer.active = false;
});

// Click tạo sóng xung kích hắc hóa
window.addEventListener('mousedown', (e) => {
  shockwaves.push({
    x: e.clientX,
    y: e.clientY,
    radius: 6,
    maxRadius: 150,
    alpha: 0.55
  });
});

// 1A. Sương mù bóng tối trôi chậm ở hậu cảnh
const mistClouds = Array.from({ length: 5 }, (_, i) => ({
  x: Math.random() * width,
  y: Math.random() * height,
  radius: Math.random() * 220 + 220,
  vx: (Math.random() - 0.5) * 0.22,
  vy: (Math.random() - 0.5) * 0.18,
  color: i % 2 === 0 ? '90, 24, 154' : '150, 15, 70',
  alpha: Math.random() * 0.08 + 0.05
}));

// 1B. Tro tàn & Tàn hồn hắc ám (không nối dây)
const ashCount = 52;
const ashes = [];
const voidColors = [
  '199, 125, 255', // Tím ma mị
  '138, 43, 226',  // Tím hắc ám
  '255, 42, 133'   // Đỏ hồng bị nguyền
];

class CursedAsh {
  constructor() {
    this.reset(true);
  }

  reset(initial = false) {
    this.x = Math.random() * width;
    this.y = initial ? Math.random() * height : height + 20;
    this.prevX = this.x;
    this.prevY = this.y;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.9 + 0.35);
    this.size = Math.random() * 2.2 + 0.9;
    this.alpha = Math.random() * 0.65 + 0.2;
    this.color = voidColors[Math.floor(Math.random() * voidColors.length)];
    this.seed = Math.random() * 100;
    this.turbulence = Math.random() * 0.45 + 0.15;
  }

  update(time) {
    this.prevX = this.x;
    this.prevY = this.y;

    // Chuyển động uốn lượn tự nhiên như tro tàn trong luồng khí tối
    const swirl = Math.sin(time * 0.0015 + this.seed) * this.turbulence;
    this.vx += (swirl - this.vx) * 0.03;

    // Bị luồng hắc khí từ chuột thổi dạt & cuốn xoáy
    if (pointer.active && pointer.x !== null) {
      const dx = this.x - pointer.x;
      const dy = this.y - pointer.y;
      const dist = Math.hypot(dx, dy);
      const pushRadius = 140;

      if (dist < pushRadius && dist > 1) {
        const force = (1 - dist / pushRadius) * 0.85;
        this.vx += (dx / dist) * force - (dy / dist) * force * 0.45;
        this.vy += (dy / dist) * force + (dx / dist) * force * 0.45;
      }
    }

    this.x += this.vx;
    this.y += this.vy;

    // Dần trở về tốc độ bay lên ổn định
    this.vy += (-0.75 - this.vy) * 0.015;

    if (this.y < -25 || this.x < -40 || this.x > width + 40) {
      this.reset(false);
    }
  }

  draw() {
    // Đuôi tàn lửa mờ ảo
    ctx.beginPath();
    ctx.moveTo(this.prevX, this.prevY);
    ctx.lineTo(this.x, this.y);
    ctx.strokeStyle = `rgba(${this.color}, ${this.alpha * 0.6})`;
    ctx.lineWidth = this.size * 1.1;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Lõi tro tàn
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
    ctx.fill();
  }
}

for (let i = 0; i < ashCount; i++) {
  ashes.push(new CursedAsh());
}

// 1C. Sinh vết nứt hư không ngẫu nhiên ở nền sâu
function spawnVoidCrack() {
  const startX = Math.random() * width;
  const startY = Math.random() * height;
  const segments = Math.floor(Math.random() * 5) + 5;
  const points = [{ x: startX, y: startY }];

  let cx = startX;
  let cy = startY;
  let baseAngle = Math.random() * Math.PI * 2;

  for (let i = 0; i < segments; i++) {
    baseAngle += (Math.random() - 0.5) * 1.3;
    const len = Math.random() * 28 + 14;
    cx += Math.cos(baseAngle) * len;
    cy += Math.sin(baseAngle) * len;
    points.push({ x: cx, y: cy });
  }

  voidCracks.push({
    points,
    alpha: 0.42,
    isCrimson: Math.random() < 0.4
  });
}

// 1D. Vẽ vòng ấn chú hắc ám mờ quanh chuột
function drawAbyssalSigil() {
  if (sigil.alpha <= 0.01) return;

  ctx.save();
  ctx.translate(sigil.x, sigil.y);
  ctx.rotate(sigil.angle);

  // Vầng tối trung tâm
  const aura = ctx.createRadialGradient(0, 0, 2, 0, 0, 68);
  aura.addColorStop(0, `rgba(255, 42, 133, ${0.12 * sigil.alpha})`);
  aura.addColorStop(0.5, `rgba(123, 44, 191, ${0.1 * sigil.alpha})`);
  aura.addColorStop(1, 'rgba(5, 2, 10, 0)');
  ctx.fillStyle = aura;
  ctx.beginPath();
  ctx.arc(0, 0, 68, 0, Math.PI * 2);
  ctx.fill();

  // Vòng ấn chú đứt đoạn xoay chậm
  ctx.strokeStyle = `rgba(199, 125, 255, ${0.26 * sigil.alpha})`;
  ctx.lineWidth = 1;
  ctx.setLineDash([8, 10, 3, 10]);
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.stroke();

  // Vòng trong xoay ngược chiều
  ctx.rotate(-sigil.angle * 2.2);
  ctx.strokeStyle = `rgba(255, 42, 133, ${0.22 * sigil.alpha})`;
  ctx.setLineDash([4, 14]);
  ctx.beginPath();
  ctx.arc(0, 0, 18, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore();
}

function animateVoid(time = 0) {
  ctx.clearRect(0, 0, width, height);

  // 1. Vẽ sương mù bóng tối
  for (const m of mistClouds) {
    m.x += m.vx;
    m.y += m.vy;
    if (m.x < -m.radius) m.x = width + m.radius;
    if (m.x > width + m.radius) m.x = -m.radius;
    if (m.y < -m.radius) m.y = height + m.radius;
    if (m.y > height + m.radius) m.y = -m.radius;

    const grad = ctx.createRadialGradient(m.x, m.y, 0, m.x, m.y, m.radius);
    grad.addColorStop(0, `rgba(${m.color}, ${m.alpha})`);
    grad.addColorStop(1, `rgba(${m.color}, 0)`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 2. Vết nứt hư không thi thoảng lóe lên
  if (Math.random() < 0.012 && voidCracks.length < 3) {
    spawnVoidCrack();
  }

  for (let i = voidCracks.length - 1; i >= 0; i--) {
    const c = voidCracks[i];
    ctx.beginPath();
    ctx.moveTo(c.points[0].x, c.points[0].y);
    for (let k = 1; k < c.points.length; k++) {
      ctx.lineTo(c.points[k].x, c.points[k].y);
    }
    ctx.strokeStyle = c.isCrimson
      ? `rgba(255, 42, 133, ${c.alpha})`
      : `rgba(199, 125, 255, ${c.alpha})`;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    c.alpha -= 0.012;
    if (c.alpha <= 0) voidCracks.splice(i, 1);
  }

  // 3. Khói hắc ám từ chuột
  for (let i = smokes.length - 1; i >= 0; i--) {
    const s = smokes[i];
    s.x += s.vx;
    s.y += s.vy;
    s.radius += (s.maxRadius - s.radius) * 0.04;
    s.alpha -= 0.0065;

    if (s.alpha <= 0) {
      smokes.splice(i, 1);
      continue;
    }

    const color = s.isCrimson ? '255, 42, 133' : '123, 44, 191';
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.radius);
    grad.addColorStop(0, `rgba(${color}, ${s.alpha})`);
    grad.addColorStop(1, 'rgba(5, 2, 10, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // 4. Sóng xung kích khi click
  for (let i = shockwaves.length - 1; i >= 0; i--) {
    const w = shockwaves[i];
    w.radius += (w.maxRadius - w.radius) * 0.1;
    w.alpha -= 0.022;

    if (w.alpha <= 0) {
      shockwaves.splice(i, 1);
      continue;
    }

    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 42, 133, ${w.alpha})`;
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(w.x, w.y, w.radius * 0.72, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(199, 125, 255, ${w.alpha * 0.6})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // 5. Cập nhật & vẽ tro tàn hắc hóa
  for (const ash of ashes) {
    ash.update(time);
    ash.draw();
  }

  // 6. Cập nhật & vẽ vòng ấn chú chuột
  if (pointer.active && pointer.x !== null) {
    sigil.x += (pointer.x - sigil.x) * 0.16;
    sigil.y += (pointer.y - sigil.y) * 0.16;
    sigil.alpha += (1 - sigil.alpha) * 0.12;
  } else {
    sigil.alpha += (0 - sigil.alpha) * 0.08;
  }
  sigil.angle += 0.012;
  drawAbyssalSigil();

  requestAnimationFrame(animateVoid);
}
animateVoid();

// ========================================================
// 2. QUẢN LÝ DỮ LIỆU & HIỂN THỊ DANH SÁCH PACK
// ========================================================
const packGrid = document.getElementById('packGrid');
const footerNote = document.getElementById('footerNote');
const packCounter = document.getElementById('packCounter');
const defaultPlaceholder = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&q=80";

let currentVersion = 'java';
let searchQuery = '';

function filterPacks(list) {
  if (!searchQuery) return list;
  const q = searchQuery.toLowerCase().trim();

  return list.filter((pack) => {
    const titleMatch = pack.title && pack.title.toLowerCase().includes(q);
    let keyMatch = false;
    const packKey = pack.key || pack.keys;

    if (packKey) {
      if (Array.isArray(packKey)) {
        keyMatch = packKey.some((k) => String(k).toLowerCase().includes(q));
      } else if (typeof packKey === 'string') {
        keyMatch = packKey.toLowerCase().includes(q);
      }
    }
    return titleMatch || keyMatch;
  });
}

function renderPacks(list) {
  packGrid.innerHTML = '';
  packCounter.textContent = `PACKS: ${list.length}`;

  if (!list || list.length === 0) {
    packGrid.innerHTML = `
      <div class="empty-box">
        <strong>VOID IS EMPTY</strong>
        <div>${
          searchQuery
            ? `Không tìm thấy pack nào khớp với từ khóa "${searchQuery}"`
            : `Hiện chưa có pack nào trong mục ${currentVersion.toUpperCase()}.`
        }</div>
      </div>
    `;
    return;
  }

  list.forEach((pack) => {
    const card = document.createElement('div');
    card.className = 'pack-card';

    let currentIndex = 0;
    let intervalId = null;
    const totalImages = pack.images ? pack.images.length : 0;

    const slidesHtml = (pack.images || []).map((img) => `
      <div class="carousel-slide">
        <img src="${img}" onerror="this.src='${defaultPlaceholder}'" alt="preview">
      </div>
    `).join('');

    const navHtml = totalImages > 1 ? `
      <button class="slide-btn slide-prev" aria-label="Ảnh trước">❮</button>
      <button class="slide-btn slide-next" aria-label="Ảnh sau">❯</button>
    ` : '';

    card.innerHTML = `
      <div class="carousel-box">
        <div class="carousel-track">${slidesHtml}</div>
        ${navHtml}
      </div>
      <div class="card-body">
        <div class="card-title" title="${pack.title}">${pack.title}</div>
        <div class="card-info">
          <span class="ver-chip">${currentVersion.toUpperCase()}</span>
          <span class="pic-count">${totalImages} ẢNH</span>
        </div>
      </div>
    `;

    const track = card.querySelector('.carousel-track');

    function updateSlide(idx) {
      currentIndex = idx;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    }

    function nextSlide() {
      updateSlide((currentIndex + 1) % totalImages);
    }

    function prevSlide() {
      updateSlide((currentIndex - 1 + totalImages) % totalImages);
    }

    if (totalImages > 1) {
      card.querySelector('.slide-next').addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
      });

      card.querySelector('.slide-prev').addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
      });

      card.addEventListener('mouseenter', () => {
        intervalId = setInterval(nextSlide, 1600);
      });

      card.addEventListener('mouseleave', () => {
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      });
    }

    card.addEventListener('click', () => {
      openModal(pack, currentIndex);
    });

    packGrid.appendChild(card);
  });
}

function updateView() {
  if (currentVersion === 'java') {
    renderPacks(filterPacks(javaPackList));
    footerNote.textContent = notes.java;
  } else {
    renderPacks(filterPacks(bedrockPackList));
    footerNote.textContent = notes.bedrock;
  }
}

function switchVersion(type) {
  currentVersion = type;
  document.getElementById('tabJava').classList.toggle('active', type === 'java');
  document.getElementById('tabBedrock').classList.toggle('active', type === 'bedrock');
  updateView();
}

// ========================================================
// 3. TÌM KIẾM & TAG NHANH
// ========================================================
const searchInput = document.getElementById('searchInput');
const searchClearBtn = document.getElementById('searchClearBtn');
const voidTags = document.querySelectorAll('.void-tag');

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  searchClearBtn.style.display = searchQuery ? 'block' : 'none';
  updateView();
});

searchClearBtn.addEventListener('click', () => {
  searchInput.value = '';
  searchQuery = '';
  searchClearBtn.style.display = 'none';
  searchInput.focus();
  updateView();
});

voidTags.forEach((btn) => {
  btn.addEventListener('click', () => {
    const tag = btn.getAttribute('data-tag');
    searchInput.value = tag;
    searchQuery = tag;
    searchClearBtn.style.display = 'block';
    updateView();
  });
});

// ========================================================
// 4. MODAL CHI TIẾT PACK
// ========================================================
const detailModal = document.getElementById('detailModal');
const btnCloseModal = document.getElementById('btnCloseModal');
const modalTrack = document.getElementById('modalCarouselTrack');
const modalPrev = document.getElementById('modalPrev');
const modalNext = document.getElementById('modalNext');
const modalTitle = document.getElementById('modalTitle');
const modalDesc = document.getElementById('modalDesc');
const modalLinkBtn = document.getElementById('modalLinkBtn');
const btnCopyLink = document.getElementById('btnCopyLink');

let modalIndex = 0;
let modalTotal = 0;
let activeLink = '';

function updateModalSlide(idx) {
  modalIndex = idx;
  modalTrack.style.transform = `translateX(-${modalIndex * 100}%)`;
}

modalNext.addEventListener('click', (e) => {
  e.stopPropagation();
  updateModalSlide((modalIndex + 1) % modalTotal);
});

modalPrev.addEventListener('click', (e) => {
  e.stopPropagation();
  updateModalSlide((modalIndex - 1 + modalTotal) % modalTotal);
});

function openModal(pack, initialIdx = 0) {
  modalTotal = pack.images ? pack.images.length : 0;
  modalIndex = initialIdx;

  modalTrack.innerHTML = (pack.images || []).map((img) => `
    <div class="carousel-slide">
      <img src="${img}" onerror="this.src='${defaultPlaceholder}'" alt="preview">
    </div>
  `).join('');

  const showArrows = modalTotal > 1 ? 'flex' : 'none';
  modalPrev.style.display = showArrows;
  modalNext.style.display = showArrows;

  updateModalSlide(modalIndex);
  modalTitle.textContent = pack.title;
  modalDesc.textContent = pack.desc || 'Không có mô tả chi tiết cho pack này.';

  activeLink = pack.link;
  modalLinkBtn.href = pack.link;
  btnCopyLink.textContent = '📋 SAO CHÉP LINK';

  detailModal.classList.add('active');
}

function closeModal() {
  detailModal.classList.remove('active');
}

btnCloseModal.addEventListener('click', closeModal);
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) closeModal();
});

btnCopyLink.addEventListener('click', () => {
  navigator.clipboard.writeText(activeLink).then(() => {
    btnCopyLink.textContent = '✅ ĐÃ SAO CHÉP!';
    setTimeout(() => {
      btnCopyLink.textContent = '📋 SAO CHÉP LINK';
    }, 2000);
  });
});

// ========================================================
// 5. HỘP THƯ THÔNG BÁO
// ========================================================
const mailBtn = document.getElementById('mailBtn');
const mailModal = document.getElementById('mailModal');
const btnCloseMail = document.getElementById('btnCloseMail');
const btnConfirmMail = document.getElementById('btnConfirmMail');
const mailRedDot = document.getElementById('mailRedDot');

function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash.toString();
}

const letterHash = simpleHash(letterData.title + '::' + letterData.content);
const savedHash = localStorage.getItem('tdamc_letter_hash');

if (savedHash !== letterHash) {
  mailRedDot.classList.add('show');
}

function openMail() {
  document.getElementById('mailTitle').textContent = letterData.title;
  document.getElementById('mailBody').textContent = letterData.content;
  mailModal.classList.add('active');

  localStorage.setItem('tdamc_letter_hash', letterHash);
  mailRedDot.classList.remove('show');
}

function closeMail() {
  mailModal.classList.remove('active');
}

mailBtn.addEventListener('click', openMail);
btnCloseMail.addEventListener('click', closeMail);
btnConfirmMail.addEventListener('click', closeMail);
mailModal.addEventListener('click', (e) => {
  if (e.target === mailModal) closeMail();
});

// Hỗ trợ phím ESC để đóng modal nhanh
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeModal();
    closeMail();
  }
});

// Khởi chạy ban đầu
updateView();