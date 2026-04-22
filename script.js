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
const ACCOUNTS = {
  groom:        [{ bank: '우리은행', person: '정민재', number: '1002-747-804723' }],
  bride:        [{ bank: '신한은행', person: '김하윤', number: '110-440-092401' }],
  groomParents: [
    { bank: '국민은행', person: '최향지', number: '937101-01-403763' },
    { bank: '국민은행', person: '정귀석', number: '937101-01-403763' },
  ],
  brideParents: [
    { bank: '하나은행', person: '김수만', number: '184-18-277544' },
    { bank: '광주은행', person: '김안숙', number: '420-107-067637' },
  ],
};

function renderAccounts(side) {
  const display = document.getElementById('account-display');
  display.textContent = '';

  ACCOUNTS[side].forEach((acct, i) => {
    const row = document.createElement('div');
    row.className = 'account-row';

    const name = document.createElement('p');
    name.className = 'account-name';
    name.textContent = acct.person;

    const copyText = `${acct.bank.replace('은행', '')} ${acct.number}`;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = '복사';
    btn.addEventListener('click', () => copyToClipboard(copyText, btn));

    row.appendChild(name);
    row.appendChild(btn);
    display.appendChild(row);

    if (i < ACCOUNTS[side].length - 1) {
      const sep = document.createElement('hr');
      sep.className = 'account-sep';
      display.appendChild(sep);
    }
  });
}

let currentSide = null;

function toggleAccount(side) {
  const display = document.getElementById('account-display');
  if (currentSide === side && !display.classList.contains('hidden')) {
    display.classList.add('hidden');
    currentSide = null;
    return;
  }
  renderAccounts(side);
  currentSide = side;
  display.classList.remove('hidden');
}

function copyToClipboard(number, btn) {
  navigator.clipboard.writeText(number).then(() => {
    btn.textContent = '복사됨 ✓';
    btn.style.color = 'var(--color-point)';
    btn.style.borderColor = 'var(--color-point)';
    setTimeout(() => {
      btn.textContent = '복사';
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 2000);
  }).catch(() => {});
}

// ─── BGM ─────────────────────────────────────────────────────────────────────
let bgmPlaying = false;

function setBgmState(playing) {
  const btn = document.getElementById('bgmBtn');
  const icon = document.getElementById('bgmIcon');
  bgmPlaying = playing;
  btn.classList.toggle('playing', playing);
  icon.textContent = playing ? '♬' : '♪';
}

function toggleBgm() {
  const audio = document.getElementById('bgm');
  if (!audio || audio.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) return;

  autoPlayDone = true;
  removeAutoPlayListeners();

  if (bgmPlaying) {
    audio.pause();
    setBgmState(false);
  } else {
    audio.play().catch(() => {});
    setBgmState(true);
  }
}

// 첫 번째 사용자 인터랙션 시 자동 재생 (한 번만 실행)
let autoPlayDone = false;

function removeAutoPlayListeners() {
  document.removeEventListener('click', autoPlayBgm);
  document.removeEventListener('touchstart', autoPlayBgm);
  document.removeEventListener('scroll', autoPlayBgm);
}

function autoPlayBgm() {
  if (autoPlayDone) return;
  autoPlayDone = true;
  removeAutoPlayListeners();

  const audio = document.getElementById('bgm');
  if (!audio) return;
  audio.play().then(() => {
    setBgmState(true);
  }).catch(() => {});
}

// 페이지 로드 시 자동재생 시도 (브라우저가 허용하면 즉시 재생)
window.addEventListener('load', function() {
  const audio = document.getElementById('bgm');
  if (!audio) return;
  audio.play().then(() => {
    autoPlayDone = true;
    removeAutoPlayListeners();
    setBgmState(true);
  }).catch(() => {
    // 브라우저가 차단한 경우 첫 인터랙션 시 재생
    document.addEventListener('click', autoPlayBgm);
    document.addEventListener('touchstart', autoPlayBgm);
    document.addEventListener('scroll', autoPlayBgm, { passive: true });
  });
});

// ─── Kakao Map ───────────────────────────────────────────────────────────────
const VENUE_LAT = 37.4279;
const VENUE_LNG = 126.7999;

function initKakaoMap() {
  try {
    const container = document.getElementById('kakaoMap');
    if (!container) return;

    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(VENUE_LAT, VENUE_LNG),
      level: 4
    });

    const geocoder = new kakao.maps.services.Geocoder();
    geocoder.addressSearch('경기도 광명시 광명역로 21', function(result, status) {
      if (status === kakao.maps.services.Status.OK) {
        const coords = new kakao.maps.LatLng(result[0].y, result[0].x);
        map.setCenter(coords);
        const marker = new kakao.maps.Marker({ position: coords, map });
        new kakao.maps.InfoWindow({
          content: '<div style="padding:6px 10px;font-size:13px;white-space:nowrap;">광명역사컨벤션웨딩홀</div>'
        }).open(map, marker);
      }
    });
  } catch(e) {}
}

window.addEventListener('load', function() {
  if (typeof kakao !== 'undefined') {
    kakao.maps.load(initKakaoMap);
  }

});

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

// ─── Scroll Indicator ────────────────────────────────────────────────────────
const scrollIndicator = document.querySelector('.scroll-indicator');
if (scrollIndicator) {
  window.addEventListener('scroll', () => {
    scrollIndicator.style.opacity = window.scrollY > 80 ? '0' : '0.5';
  }, { passive: true });
}
