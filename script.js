'use strict';
const root = document.documentElement;
const safeGet = key => { try { return localStorage.getItem(key); } catch { return null; } };
const save = (key,value) => { try { localStorage.setItem(key,value); } catch {} };
// Each language is its own page (root = English, /ko/, /ja/, /de/, /es/); the page's lang attribute is the source of truth.
const language = (root.lang || 'en').slice(0, 2);
const themeLabels = {en: ['Switch to light theme', 'Switch to dark theme'], ko: ['라이트 테마로 전환', '다크 테마로 전환'], ja: ['ライトテーマに切り替え', 'ダークテーマに切り替え'], de: ['Zum hellen Design wechseln', 'Zum dunklen Design wechseln'], es: ['Cambiar al tema claro', 'Cambiar al tema oscuro']};
const siteRoot = new URL('.', document.currentScript?.src || location.href);
const themeButton = document.getElementById('theme');
function updateThemeLabel() {
 const dark = root.dataset.theme === 'dark';
 themeButton.textContent = dark ? '☀' : '◐';
 themeButton.setAttribute('aria-label', (themeLabels[language] || themeLabels.en)[dark ? 0 : 1]);
 themeButton.setAttribute('aria-pressed', String(dark));
 document.querySelector('meta[name="theme-color"]').content = dark ? '#202221' : '#F5F7F6';
}
function toc() {
 const target = document.getElementById('toc');
 if (!target) return;
 const pageLink = [...document.querySelectorAll('.sidebar a')].find(a => a.getAttribute('href')?.split('#')[0] === current);
 if (!pageLink) return;
 const oldContainer = target.closest('aside.toc');
 target.classList.add('sidebar-toc');
 target.setAttribute('aria-label', document.querySelector('.article h1')?.textContent.trim() || 'Page sections');
 pageLink.after(target);
 oldContainer?.remove();
 target.replaceChildren();
 document.querySelectorAll('.article section[id]').forEach(section => {
   const heading = section.querySelector('h2'); if (!heading) return;
   const a = document.createElement('a'); a.href = '#' + section.id; a.textContent = heading.textContent; target.append(a);
 });
}
// Go to the same page in the chosen language, or that language's home when the page is not translated.
function switchLanguage(target) {
 const alternate = document.querySelector(`link[rel="alternate"][hreflang="${target}"]`);
 location.href = alternate ? alternate.href + location.hash : new URL(target === 'en' ? './' : `${target}/`, siteRoot).href;
}
document.querySelectorAll('[data-language-select]').forEach(select => {
 select.value = language;
 select.addEventListener('change', () => switchLanguage(select.value));
});
themeButton.addEventListener('click', () => { root.dataset.theme = root.dataset.theme === 'dark' ? 'light' : 'dark'; save('momention-theme',root.dataset.theme); updateThemeLabel(); });
const systemTheme = matchMedia('(prefers-color-scheme: dark)');
systemTheme.addEventListener('change', event => { if (!safeGet('momention-theme')) { root.dataset.theme = event.matches ? 'dark' : 'light'; updateThemeLabel(); } });
if (!root.dataset.theme) root.dataset.theme = systemTheme.matches ? 'dark' : 'light';
const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.sidebar a,.nav-links a').forEach(a => { if (a.getAttribute('href') === current) { a.classList.add('active'); a.setAttribute('aria-current','page'); } });
updateThemeLabel(); toc();
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
 const guideTip = document.createElement('div');
 guideTip.className = 'guide-tip';
 guideTip.setAttribute('role', 'tooltip');
 guideTip.hidden = true;
 guideTip.innerHTML = '<strong></strong><p></p>';
 guideCapture.append(guideTip);
 // Show the item's title and description beside its area, reading the text in the current language.
 function showGuideTip(id) {
  const item = document.querySelector(`.guide-items li[data-guide="${id}"]`);
  const spots = [...guideCapture.querySelectorAll(`.guide-spot[data-guide="${id}"]`)];
  if (!item || !spots.length) { guideTip.hidden = true; return; }
  guideTip.querySelector('strong').textContent = `${id}. ${(item.querySelector('h4, .guide-item-title span[data-en]')?.textContent || '').trim()}`;
  guideTip.querySelector('p').textContent = (item.querySelector('p[data-en]')?.textContent || '').trim();
  guideTip.hidden = false;
  const box = guideCapture.getBoundingClientRect();
  const rects = spots.map(spot => spot.getBoundingClientRect());
  const top = Math.min(...rects.map(r => r.top)) - box.top;
  const bottom = Math.max(...rects.map(r => r.bottom)) - box.top;
  const center = (Math.min(...rects.map(r => r.left)) + Math.max(...rects.map(r => r.right))) / 2 - box.left;
  const width = guideTip.offsetWidth, height = guideTip.offsetHeight, gap = 8;
  const below = bottom + gap + height <= box.height - gap || top - gap - height < gap;
  const y = below ? Math.min(bottom + gap, box.height - height - gap) : top - gap - height;
  guideTip.style.left = `${Math.round(Math.min(Math.max(center - width / 2, gap), box.width - width - gap))}px`;
  guideTip.style.top = `${Math.round(Math.max(y, gap))}px`;
 }
 function setGuide(id) {
  activeGuide = id;
  if (id === null) guideTip.hidden = true; else showGuideTip(id);
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
 document.querySelector('.guide-items')?.addEventListener('mouseleave', () => { if (matchMedia('(hover: hover)').matches) setGuide(null); });
 guideCapture.querySelectorAll('.guide-badge').forEach(badge => {
  badge.addEventListener('mouseenter', () => setGuide(badge.dataset.guide));
  badge.addEventListener('focus', () => setGuide(badge.dataset.guide));
  badge.addEventListener('click', () => {
   setGuide(badge.dataset.guide);
   if (matchMedia('(min-width: 768px)').matches) document.querySelector(`.guide-items li[data-guide="${badge.dataset.guide}"]`)?.scrollIntoView({block: 'nearest', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'});
  });
 });
 guideCapture.querySelectorAll('.guide-spot').forEach(spot => {
  spot.addEventListener('mouseenter', () => setGuide(spot.dataset.guide));
  spot.addEventListener('click', () => setGuide(spot.dataset.guide));
 });
 const canHover = matchMedia('(hover: hover)');
 guideCapture.addEventListener('mouseleave', () => { if (canHover.matches) setGuide(null); });
 guideCapture.addEventListener('focusout', event => { if (!guideCapture.contains(event.relatedTarget)) setGuide(null); });
}

// Center the hero phone between the headline's tally dot and the right end of the section divider.
const heroProduct = document.querySelector('.hero-product');
const heroTally = document.querySelector('.kinetic-hero .recording-tally');
const heroDivider = document.querySelector('.kinetic-hero')?.nextElementSibling;
function alignHeroProduct() {
 if (!heroProduct || !heroTally || !heroDivider) return;
 heroProduct.style.setProperty('--hero-shift', '0px');
 if (matchMedia('(max-width: 767px)').matches) return;
 const tally = heroTally.getBoundingClientRect();
 const product = heroProduct.getBoundingClientRect();
 const target = (tally.left + tally.width / 2 + heroDivider.getBoundingClientRect().right) / 2;
 const shift = Math.min(target - (product.left + product.width / 2), document.documentElement.clientWidth - 8 - product.right);
 heroProduct.style.setProperty('--hero-shift', `${Math.round(shift)}px`);
}
alignHeroProduct();
addEventListener('resize', alignHeroProduct);
document.fonts?.ready.then(alignHeroProduct);
