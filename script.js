'use strict';
const root = document.documentElement;
const safeGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
const save = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
let language = safeGet('momention-language') === 'ko' ? 'ko' : 'en';
const langButton = document.getElementById('language');
const themeButton = document.getElementById('theme');
function updateThemeLabel() {
 const dark = root.dataset.theme === 'dark';
 themeButton.textContent = dark ? '☀' : '◐';
 themeButton.setAttribute('aria-label', language === 'ko' ? (dark ? '라이트 테마로 전환' : '다크 테마로 전환') : (dark ? 'Switch to light theme' : 'Switch to dark theme'));
 themeButton.setAttribute('aria-pressed', String(dark));
 document.querySelector('meta[name="theme-color"]').content = dark ? '#202221' : '#F5F7F6';
}
function toc() {
 const target = document.getElementById('toc');
 if (!target) return;
 target.replaceChildren();
 document.querySelectorAll('.article section[id]').forEach(section => {
   const heading = section.querySelector('h2'); if (!heading) return;
   const a = document.createElement('a'); a.href = '#' + section.id; a.textContent = heading.textContent; target.append(a);
 });
}
function translate() {
 root.lang = language;
 document.querySelectorAll('[data-video-label-en]').forEach(el => { el.setAttribute('aria-label', el.getAttribute('data-video-label-' + language)); });
 document.querySelectorAll('[data-en][data-ko]').forEach(el => { el.textContent = el.dataset[language]; });
 langButton.textContent = language === 'en' ? '한국어' : 'EN';
 langButton.setAttribute('aria-label', language === 'en' ? '한국어로 전환' : 'Switch to English');
 document.querySelector('.skip').textContent = language === 'en' ? 'Skip to content' : '본문으로 건너뛰기';
 updateThemeLabel(); toc();
}
langButton.addEventListener('click', () => { language = language === 'en' ? 'ko' : 'en'; save('momention-language',language); translate(); });
themeButton.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; save('momention-theme',root.dataset.theme); updateThemeLabel(); });
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
systemTheme.addEventListener('change', event => { if (!safeGet('momention-theme')) { root.dataset.theme = event.matches ? 'dark' : 'light'; updateThemeLabel(); } });
if (!root.dataset.theme) root.dataset.theme = systemTheme.matches ? 'dark' : 'light';
const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.sidebar a,.nav-links a').forEach(a => { if (a.getAttribute('href') === current) { a.classList.add('active'); a.setAttribute('aria-current','page'); } });
translate();
// Requested continuous, muted, inline video playback. Native controls remain available.
const autoplayVideos = [...document.querySelectorAll('video:not([data-guide-video])')];
function startVideos() {
 autoplayVideos.forEach(video => {
  video.muted = true;
  video.defaultMuted = true;
  video.loop = true;
  video.autoplay = true;
  video.playsInline = true;
  video.play().catch(() => {}); // Browser policy may require interaction.
 });
}
autoplayVideos.forEach(video => video.addEventListener('canplay', () => {
 if (video.autoplay && video.paused) video.play().catch(() => {});
}, {once:true}));
startVideos();
document.addEventListener('visibilitychange', () => { if (!document.hidden) startVideos(); });
document.addEventListener('pointerdown', startVideos, {once:true});

// Read the actual dial color so the tally stays in sync through seeks and loops.
const heroVideo = document.querySelector('.hero-product video');
const recordingTally = document.querySelector('.recording-tally');
if (heroVideo && recordingTally) {
 const sample = document.createElement('canvas');
 sample.width = sample.height = 1;
 const context = sample.getContext('2d', { willReadFrequently: true });
 function updateTally() {
  if (!context || heroVideo.readyState < 2) return;
  try {
   let red = 0, green = 0;
   for (const [x, y] of [[.5, .38], [.3, .48], [.7, .48]]) {
    context.drawImage(heroVideo, Math.floor(heroVideo.videoWidth * x), Math.floor(heroVideo.videoHeight * y), 1, 1, 0, 0, 1, 1);
    const pixel = context.getImageData(0, 0, 1, 1).data;
    red += pixel[0]; green += pixel[1];
   }
   recordingTally.classList.toggle('is-recording', red > 210 && red > green * 1.25);
  } catch {
   recordingTally.classList.remove('is-recording');
  }
 }
 if ('requestVideoFrameCallback' in heroVideo) {
  const onFrame = () => { updateTally(); heroVideo.requestVideoFrameCallback(onFrame); };
  heroVideo.requestVideoFrameCallback(onFrame);
 } else {
  heroVideo.addEventListener('timeupdate', updateTally);
 }
 heroVideo.addEventListener('seeked', updateTally);
 heroVideo.addEventListener('loadeddata', updateTally);
 heroVideo.addEventListener('emptied', () => recordingTally.classList.remove('is-recording'));
}

const guideCapture = document.querySelector('[data-guide-capture]');
if (guideCapture) {
 const svgNS = 'http://www.w3.org/2000/svg';
 const dim = document.createElementNS(svgNS, 'svg');
 dim.setAttribute('class', 'guide-dim'); dim.setAttribute('viewBox', '0 0 100 100'); dim.setAttribute('preserveAspectRatio', 'none'); dim.setAttribute('aria-hidden', 'true');
 dim.innerHTML = '<defs><mask id="guide-dim-mask"><rect width="100" height="100" fill="white"/><g class="guide-holes"></g></mask></defs><rect width="100" height="100" fill="rgba(0,0,0,.6)" mask="url(#guide-dim-mask)"/>';
 guideCapture.querySelector('video').after(dim);
 const holes = dim.querySelector('.guide-holes');
 const guideItems = document.querySelectorAll('.guide-items li[data-guide]');
 const guideParts = guideCapture.querySelectorAll('[data-guide]');
 const guideVideo = guideCapture.querySelector('[data-guide-video]');
 const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
 let activeGuide = null;
 let guideVisible = false;
 // Load the clip only once the guide is near the viewport; pause it while an item is highlighted.
 function syncGuideVideo() {
  if (guideVisible && activeGuide === null && !reduceMotion.matches && !document.hidden) guideVideo.play().catch(() => {});
  else guideVideo.pause();
 }
 if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
   guideVisible = entries[0].isIntersecting;
   if (guideVisible && !guideVideo.src) guideVideo.src = guideVideo.dataset.src;
   syncGuideVideo();
  }, {rootMargin: '200px'}).observe(guideCapture);
 } else { guideVideo.src = guideVideo.dataset.src; guideVisible = true; }
 document.addEventListener('visibilitychange', syncGuideVideo);
 function setGuide(id) {
  activeGuide = id;
  syncGuideVideo();
  guideCapture.classList.toggle('has-active', id !== null);
  [...guideParts, ...guideItems].forEach(el => el.classList.toggle('is-active', el.dataset.guide === id));
  holes.replaceChildren(...[...guideCapture.querySelectorAll(`.guide-spot[data-guide="${id}"]`)].map(spot => {
   const [x, y, w, h] = ['left', 'top', 'width', 'height'].map(key => parseFloat(spot.style[key]));
   const round = spot.classList.contains('is-round');
   const shape = document.createElementNS(svgNS, round ? 'ellipse' : 'rect');
   const attrs = round ? {cx: x + w / 2, cy: y + h / 2, rx: w / 2, ry: h / 2} : {x, y, width: w, height: h, rx: 1.5, ry: .75};
   Object.entries(attrs).forEach(([key, value]) => shape.setAttribute(key, value));
   shape.setAttribute('fill', 'black');
   return shape;
  }));
 }
 guideItems.forEach(item => {
  item.addEventListener('mouseenter', () => setGuide(item.dataset.guide));
  item.addEventListener('click', () => setGuide(activeGuide === item.dataset.guide && !matchMedia('(hover: hover)').matches ? null : item.dataset.guide));
 });
 document.querySelector('.guide-items')?.addEventListener('mouseleave', () => setGuide(null));
 guideCapture.querySelectorAll('.guide-badge').forEach(badge => {
  badge.addEventListener('mouseenter', () => setGuide(badge.dataset.guide));
  badge.addEventListener('focus', () => setGuide(badge.dataset.guide));
  badge.addEventListener('click', () => {
   setGuide(badge.dataset.guide);
   document.querySelector(`.guide-items li[data-guide="${badge.dataset.guide}"]`)?.scrollIntoView({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });
 });
 guideCapture.addEventListener('mouseleave', () => setGuide(null));
 guideCapture.addEventListener('focusout', event => { if (!guideCapture.contains(event.relatedTarget)) setGuide(null); });
}
