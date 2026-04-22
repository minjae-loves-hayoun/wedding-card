// Wedding Card Script

// ─── D-day Countdown ─────────────────────────────────────────────────────────
function updateDday() {
  const wedding = new Date('2026-08-22T11:00:00+09:00');
  const now = new Date();
  const diffMs = wedding - now;
  const el = document.getElementById('dday');
  if (!el) return;

  if (diffMs < 0) {
    el.style.display = 'none';
    return;
  }

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  el.textContent = diffDays === 0 ? 'D-DAY' : `D-${diffDays}`;
}

updateDday();
setInterval(updateDday, 60000);

// ─── Gallery Dots ─────────────────────────────────────────────────────────────
function initGallery() {
  const track = document.querySelector('.gallery-track');
  const dotsContainer = document.getElementById('galleryDots');
  if (!track || !dotsContainer) return;

  const items = track.querySelectorAll('.gallery-item');
  items.forEach((_, i) => {
    const dot = document.createElement('div');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dotsContainer.appendChild(dot);
  });

  track.addEventListener('scroll', () => {
    const index = Math.round(track.scrollLeft / track.clientWidth);
    dotsContainer.querySelectorAll('.gallery-dot').forEach((d, i) => {
      d.classList.toggle('active', i === index);
    });
  }, { passive: true });
}

initGallery();

// ─── Account Toggle & Clipboard ──────────────────────────────────────────────
// 계좌번호 확정 시 여기만 수정
const ACCOUNTS = {
  groom: { name: '우리 정민재', number: '1002-747-804723' },
  bride: { name: '신한 김하윤', number: '110-440-092401' },
};

function initAccounts() {
  document.getElementById('groom-name').textContent = ACCOUNTS.groom.name;
  document.getElementById('groom-number').textContent = ACCOUNTS.groom.number;
  document.getElementById('bride-name').textContent = ACCOUNTS.bride.name;
  document.getElementById('bride-number').textContent = ACCOUNTS.bride.number;
}

function toggleAccount(side) {
  const el = document.getElementById(`account-${side}`);
  el.classList.toggle('hidden');
}

function copyAccount(side) {
  const number = ACCOUNTS[side].number;
  navigator.clipboard.writeText(number).then(() => {
    alert('계좌번호가 복사되었습니다.');
  }).catch(() => {
    // file:// 환경 등 HTTPS 외에서는 조용히 실패
  });
}

initAccounts();

// ─── BGM ─────────────────────────────────────────────────────────────────────
let bgmPlaying = false;

function toggleBgm() {
  const audio = document.getElementById('bgm');
  const btn = document.getElementById('bgmBtn');
  const icon = document.getElementById('bgmIcon');

  if (!audio || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) return;

  if (bgmPlaying) {
    audio.pause();
    btn.classList.remove('playing');
    icon.textContent = '♪';
  } else {
    audio.play().catch(() => {});
    btn.classList.add('playing');
    icon.textContent = '♬';
  }
  bgmPlaying = !bgmPlaying;
}

// ─── Scroll Reveal ───────────────────────────────────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

initReveal();
