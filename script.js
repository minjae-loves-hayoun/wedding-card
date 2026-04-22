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

document.addEventListener('click', autoPlayBgm);
document.addEventListener('touchstart', autoPlayBgm);
document.addEventListener('scroll', autoPlayBgm, { passive: true });

// ─── Kakao Map ───────────────────────────────────────────────────────────────
function initKakaoMap() {
  try {
    const container = document.getElementById('kakaoMap');
    if (!container) return;

    const map = new kakao.maps.Map(container, {
      center: new kakao.maps.LatLng(37.4279, 126.7999),
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
