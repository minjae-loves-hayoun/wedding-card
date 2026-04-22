// Wedding Card Script

// ─── Hero Image Preload ───────────────────────────────────────────────────────
(function() {
  const img = document.querySelector('.hero-bg img');
  const content = document.querySelector('.hero-content');
  if (!img || !content) return;
  function show() { content.classList.add('hero-ready'); }
  if (img.complete && img.naturalWidth > 0) show();
  else { img.addEventListener('load', show); img.addEventListener('error', show); }
})();

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
  el.textContent = diffDays === 0 ? '♥ D-day ♥' : `♥ D-${diffDays} ♥`;
}

updateDday();
setInterval(updateDday, 60000);

// ─── Gallery Autoplay (infinite loop) ────────────────────────────────────────
function initGallery() {
  const track = document.querySelector('.gallery-track');
  const dotsContainer = document.getElementById('galleryDots');
  if (!track || !dotsContainer) return;

  const origItems = Array.from(track.querySelectorAll('.gallery-item'));
  const count = origItems.length;

  // 앞뒤에 클론 삽입: [lastClone, 1, 2, ..., count, firstClone]
  const firstClone = origItems[0].cloneNode(true);
  const lastClone = origItems[count - 1].cloneNode(true);
  track.appendChild(firstClone);
  track.insertBefore(lastClone, origItems[0]);

  const allItems = Array.from(track.querySelectorAll('.gallery-item'));
  let current = 1; // 실제 첫 번째 슬라이드 (클론 건너뜀)
  let autoTimer = null;
  let autoPaused = false;

  const itemW = () => track.parentElement.clientWidth;

  function snapTo(idx) {
    current = idx;
    track.classList.add('no-transition');
    track.style.transform = `translateX(-${current * itemW()}px)`;
    track.offsetHeight;
    track.classList.remove('no-transition');
  }

  snapTo(1);

  // 도트 생성
  for (let i = 0; i < count; i++) {
    const dot = document.createElement('div');
    dot.className = 'gallery-dot' + (i === 0 ? ' active' : '');
    dotsContainer.appendChild(dot);
  }

  const counter = document.getElementById('galleryCounter');

  function updateDots() {
    const dotIdx = (current - 1 + count) % count;
    dotsContainer.querySelectorAll('.gallery-dot').forEach((d, i) => {
      d.classList.toggle('active', i === dotIdx);
    });
    if (counter) counter.textContent = `${dotIdx + 1} / ${count}`;
  }

  function goTo(idx) {
    current = idx;
    track.style.transform = `translateX(-${current * itemW()}px)`;
    updateDots();
  }

  track.addEventListener('transitionend', () => {
    if (current === 0) snapTo(count);
    else if (current === count + 1) snapTo(1);
  });

  // 라이트박스
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  let wasDragged = false;
  let lbIndex = 0;

  function lbGoTo(idx) {
    lbIndex = (idx + count) % count;
    lightboxImg.src = origItems[lbIndex].querySelector('img').src;
  }

  allItems.forEach((item, i) => {
    item.style.cursor = 'zoom-in';
    item.addEventListener('click', () => {
      if (wasDragged) { wasDragged = false; return; }
      lbIndex = ((i - 1) + count) % count;
      lightboxImg.src = origItems[lbIndex].querySelector('img').src;
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      pauseAuto();
    });
  });

  window.closeLightbox = () => {
    // 줌 리셋: maximum-scale=1 잠깐 적용 후 복원
    const viewport = document.querySelector('meta[name="viewport"]');
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0';
    setTimeout(() => { viewport.content = 'width=device-width, initial-scale=1.0'; }, 300);

    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    snapTo(lbIndex + 1);
    updateDots();
    if (!autoPaused) startAuto();
  };

  // 라이트박스 배경 클릭 시 닫기
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target === lightboxImg) closeLightbox();
  });
  lightbox.addEventListener('contextmenu', e => e.preventDefault());

  window.lbPrev = () => lbGoTo(lbIndex - 1);
  window.lbNext = () => lbGoTo(lbIndex + 1);

  // 키보드 방향키
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'ArrowRight') lbGoTo(lbIndex + 1);
    else if (e.key === 'ArrowLeft') lbGoTo(lbIndex - 1);
    else if (e.key === 'Escape') closeLightbox();
  });

  function startAuto() {
    clearInterval(autoTimer);
    if (autoPaused) return;
    autoTimer = setInterval(() => goTo(current + 1), 3000);
  }

  function pauseAuto() {
    clearInterval(autoTimer);
  }

  const pauseIcon = document.getElementById('galleryPauseIcon');
  const playIcon = document.getElementById('galleryPlayIcon');

  window.toggleGalleryAuto = function() {
    autoPaused = !autoPaused;
    if (autoPaused) {
      pauseAuto();
      pauseIcon.style.display = 'none';
      playIcon.style.display = '';
    } else {
      startAuto();
      pauseIcon.style.display = '';
      playIcon.style.display = 'none';
    }
  };

  // 스와이프 / 마우스 드래그
  let dragStartX = 0;
  let isDragging = false;

  let touchStartY = 0;
  let isHorizontalSwipe = null;

  track.addEventListener('touchstart', e => {
    if (lightbox.classList.contains('active')) return;
    if (e.touches.length > 1) { pauseAuto(); return; }
    dragStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
    isHorizontalSwipe = null;
  }, { passive: true });

  track.addEventListener('touchmove', e => {
    if (lightbox.classList.contains('active')) return;
    if (isHorizontalSwipe === null) {
      const dx = Math.abs(e.touches[0].clientX - dragStartX);
      const dy = Math.abs(e.touches[0].clientY - touchStartY);
      isHorizontalSwipe = dx > dy;
    }
    if (isHorizontalSwipe) e.preventDefault();
  }, { passive: false });

  track.addEventListener('touchend', e => {
    if (lightbox.classList.contains('active')) return;
    if (e.touches.length > 0) return;
    const diff = dragStartX - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? current + 1 : current - 1);
    if (!autoPaused) startAuto();
  }, { passive: true });

  track.addEventListener('mousedown', e => { if (lightbox.classList.contains('active')) return; dragStartX = e.clientX; isDragging = true; wasDragged = false; });
  window.addEventListener('mouseup', e => {
    if (!isDragging) return;
    isDragging = false;
    const diff = dragStartX - e.clientX;
    if (Math.abs(diff) > 50) {
      wasDragged = true;
      goTo(diff > 0 ? current + 1 : current - 1);
      if (!autoPaused) startAuto();
    }
  });

  const observer = new IntersectionObserver(entries => {
    entries[0].isIntersecting ? startAuto() : pauseAuto();
  }, { threshold: 0.1 });
  observer.observe(track.parentElement);

  window.addEventListener('resize', () => snapTo(current));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) snapTo(current);
  });
}

initGallery();

// ─── Account Toggle & Clipboard ──────────────────────────────────────────────
const ACCOUNTS = {
  groom: [
    { label: '신랑', list: [
      { bank: '우리은행', person: '정민재', number: 'MTAwMi03NDctODA0NzIz' },
    ]},
    { label: '신랑 혼주', list: [
      { bank: '국민은행', person: '정귀석', number: 'OTM3MTAxLTAxLTQwMzc2Mw==' },
      { bank: '국민은행', person: '최향지', number: 'OTM3MTAxLTAxLTQwMzc2Mw==' },
    ]},
  ],
  bride: [
    { label: '신부', list: [
      { bank: '신한은행', person: '김하윤', number: 'MTEwLTQ0MC0wOTI0MDE=' },
    ]},
    { label: '신부 혼주', list: [
      { bank: '하나은행', person: '김수만', number: 'MTg0LTE4LTI3NzU0NA==' },
      { bank: '광주은행', person: '김안숙', number: 'NDIwLTEwNy0wNjc2Mzc=' },
    ]},
  ],
};

function renderAccounts(side) {
  const display = document.getElementById('account-display');
  display.textContent = '';

  const rows = ACCOUNTS[side].flatMap(group =>
    group.list.map(acct => ({ label: group.label, ...acct }))
  );

  rows.forEach((acct, i) => {
    const row = document.createElement('div');
    row.className = 'account-row';

    const name = document.createElement('p');
    name.className = 'account-name';
    name.textContent = `${acct.label} ${acct.person}`;

    const copyText = `${acct.bank.replace('은행', '')} ${atob(acct.number)}`;
    const btn = document.createElement('button');
    btn.className = 'copy-btn';
    btn.textContent = '복사';
    btn.addEventListener('click', () => copyToClipboard(copyText, btn));

    row.appendChild(name);
    row.appendChild(btn);
    display.appendChild(row);

    if (i < rows.length - 1) {
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
  btn.classList.toggle('idle', !playing);
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
  document.removeEventListener('touchend', autoPlayBgm);
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

// 페이지 로드 시 자동재생 시도
window.addEventListener('load', function() {
  const audio = document.getElementById('bgm');
  if (!audio) return;

  audio.play().then(() => {
    autoPlayDone = true;
    removeAutoPlayListeners();
    setBgmState(true);
  }).catch(() => {
    // 모바일: touchend(스크롤 포함), 데스크탑: click
    document.getElementById('bgmBtn').classList.add('idle');
    document.addEventListener('click', autoPlayBgm);
    document.addEventListener('touchend', autoPlayBgm);
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

// ─── Prevent zoom outside lightbox ───────────────────────────────────────────
document.addEventListener('touchstart', e => {
  if (e.touches.length > 1 && !e.target.closest('#lightbox')) {
    e.preventDefault();
  }
}, { passive: false });
document.addEventListener('touchmove', e => {
  if (e.touches.length > 1 && !e.target.closest('#lightbox')) {
    e.preventDefault();
  }
}, { passive: false });
document.addEventListener('gesturestart', e => {
  if (!e.target.closest('#lightbox')) e.preventDefault();
});

// ─── Suppress long-press URL popup on nav & map links ────────────────────────
document.querySelectorAll('.sticky-nav a, .map-app-link').forEach(el => {
  el.addEventListener('contextmenu', e => e.preventDefault());
});
