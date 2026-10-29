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
 themeButton.setAttribute('aria-label', (themeLabels[language] || themeLabels.en)[dark ? 0 : 1]);
 themeButton.setAttribute('aria-checked', String(dark));
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
 let releaseDisclosure = null;
 const mobileOutline = matchMedia('(max-width:760px)');
 if (current === 'release-notes.html') {
   releaseDisclosure = document.createElement('details');
   releaseDisclosure.className = 'release-build-menu';
   const summary = document.createElement('summary');
   summary.textContent = language === 'ko' ? '빌드 목록' : 'Build list';
   pageLink.after(releaseDisclosure);
   releaseDisclosure.append(summary, target);
   const syncOutline = () => { releaseDisclosure.open = !mobileOutline.matches; };
   syncOutline();
   mobileOutline.addEventListener('change', syncOutline);
 } else {
   pageLink.after(target);
 }
 pageLink.classList.add('has-outline');
 oldContainer?.remove();
 target.replaceChildren();
 const entries = [];
 document.querySelectorAll('.article section[id]').forEach(section => {
   const heading = section.querySelector('h2'); if (!heading) return;
   // Release entries list only their build number so the outline stays short.
   const label = heading.querySelector('.release-build') || heading;
   const a = document.createElement('a'); a.href = '#' + section.id; a.textContent = label.textContent;
   if (releaseDisclosure) a.addEventListener('click', event => {
     if (!mobileOutline.matches || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
     event.preventDefault();
     releaseDisclosure.open = false;
     location.hash = a.hash;
     section.scrollIntoView({behavior: 'instant', block: 'start'});
   });
   target.append(a); entries.push({section, a});
 });
 function select(id) {
   entries.forEach(({section, a}) => {
     const selected = section.id === id;
     a.classList.toggle('active', selected);
     if (selected) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
   });
 }
 function fromHash() {
   const match = entries.find(({a}) => a.hash === location.hash);
   if (match) select(match.section.id); else fromScroll();
 }
 function fromScroll() {
   const headerOffset = (document.querySelector('.site-header')?.getBoundingClientRect().height || 76) + 40;
   const anchorOffset = (parseFloat(getComputedStyle(root).scrollPaddingTop) || 0)
     + (entries[0] ? parseFloat(getComputedStyle(entries[0].section).scrollMarginTop) || 0 : 0);
   const offset = Math.max(headerOffset, anchorOffset + 2);
   let selected = entries[0];
   for (const entry of entries) {
     if (entry.section.getBoundingClientRect().top <= offset) selected = entry;
   }
   if (selected) select(selected.section.id);
 }
 let scheduled = false;
 window.addEventListener('scroll', () => {
   if (scheduled) return;
   scheduled = true;
   requestAnimationFrame(() => { scheduled = false; fromScroll(); });
 }, {passive: true});
 window.addEventListener('hashchange', fromHash);
 fromHash();
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
const autoplayVideos = [...document.querySelectorAll('video:not([data-guide-video]):not([data-watch-video])')];
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

// Actual Watch simulator footage: loop silently only while visible.
document.querySelectorAll('[data-watch-video]').forEach(watchVideo => {
 const reducedWatchMotion = matchMedia('(prefers-reduced-motion: reduce)');
 let watchVisible = false;
 const syncWatchPlayback = () => {
  if (watchVisible && !document.hidden && !reducedWatchMotion.matches) {
   watchVideo.muted = true;
   watchVideo.play().catch(() => {});
  } else watchVideo.pause();
 };
 if ('IntersectionObserver' in window) {
  new IntersectionObserver(entries => {
   watchVisible = entries[0].isIntersecting && entries[0].intersectionRatio >= 0.2;
   syncWatchPlayback();
  }, {threshold: [0, 0.2]}).observe(watchVideo);
 }
 document.addEventListener('visibilitychange', syncWatchPlayback);
 reducedWatchMotion.addEventListener('change', syncWatchPlayback);
 document.addEventListener('pointerdown', syncWatchPlayback, {once: true});
});

// Read the actual dial color so the tally stays in sync through seeks and loops.
const heroVideo = document.querySelector('.hero-product video');
// The hero clip plays at double speed; the screen guide uses the same file at normal speed.
if (heroVideo) {
 const doubleSpeed = () => { heroVideo.defaultPlaybackRate = 2; if (heroVideo.playbackRate !== 2) heroVideo.playbackRate = 2; };
 doubleSpeed();
 ['loadedmetadata', 'play'].forEach(type => heroVideo.addEventListener(type, doubleSpeed));
}
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
    const sampleX = heroVideo.closest('.synced-product') ? (494 + 720 * x) / 1240 : x;
    const sampleY = heroVideo.closest('.synced-product') ? (28 + 1564 * y) / 1620 : y;
    context.drawImage(heroVideo, Math.floor(heroVideo.videoWidth * sampleX), Math.floor(heroVideo.videoHeight * sampleY), 1, 1, 0, 0, 1, 1);
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
 if (!heroProduct || !heroTally || !heroDivider || heroProduct.classList.contains('synced-product')) return;
 const hero = heroProduct.closest('.kinetic-hero');
 hero.style.setProperty('--hero-group-shift', '0px');
 heroProduct.style.setProperty('--hero-shift', '0px');
 if (matchMedia('(max-width: 767px)').matches) return;
 // Keep the existing gap between headline and phone, then centre the whole group
 // (headline's left edge to the phone's right edge) so both page margins match.
 const tally = heroTally.getBoundingClientRect();
 const product = heroProduct.getBoundingClientRect();
 const target = (tally.left + tally.width / 2 + heroDivider.getBoundingClientRect().right) / 2;
 const shift = Math.round(target - (product.left + product.width / 2));
 heroProduct.style.setProperty('--hero-shift', `${shift}px`);
 const viewport = document.documentElement.clientWidth;
 const left = hero.querySelector('h1').getBoundingClientRect().left;
 const right = product.right + shift;
 const groupShift = Math.max(-left + 16, ((viewport - right) - left) / 2);
 hero.style.setProperty('--hero-group-shift', `${Math.round(groupShift)}px`);
}
alignHeroProduct();
addEventListener('resize', alignHeroProduct);
document.fonts?.ready.then(alignHeroProduct);

// Hero activity roller, slot-machine style: wait, spin downward through two or three turns while
// blurring with speed, then settle with a small mechanical bounce on a shuffled pictogram.
// Position is computed each frame (modulo the icon count), so the loop never runs out of icons.
const rollerTrack = document.querySelector('.roller-track');
if (rollerTrack) {
 const cells = [...rollerTrack.children];
 const count = cells.length;
 rollerTrack.prepend(cells[count - 1].cloneNode(true));
 rollerTrack.append(cells[0].cloneNode(true), cells[1].cloneNode(true));
 let index = 0;
 // The initial display consumes index 0 in the first cycle.
 let bag = [];
 const shuffle = items => {
  for (let i = items.length - 1; i > 0; i--) {
   const j = Math.floor(Math.random() * (i + 1));
   [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
 };
 bag = shuffle(Array.from({length: count - 1}, (_, i) => i + 1));
 const nextTarget = () => {
  if (!bag.length) {
   bag = shuffle(Array.from({length: count}, (_, i) => i));
   // Selection pops from the end; avoid repeating the previous cycle's last icon.
   if (count > 1 && bag[bag.length - 1] === index) {
    const swap = Math.floor(Math.random() * (count - 1));
    [bag[swap], bag[bag.length - 1]] = [bag[bag.length - 1], bag[swap]];
   }
  }
  return bag.pop();
 };
 const render = (position, speed = 0) => {
  const p = ((position % count) + count) % count;
  rollerTrack.style.transform = `translateY(calc((var(--roller-h) - var(--cell)) / 2 - var(--cell) * ${(p + 1).toFixed(4)}))`;
  rollerTrack.style.setProperty('--roller-stretch', (1 + Math.min(speed / 40, .35)).toFixed(3));
  rollerTrack.style.filter = speed > 1 ? `blur(${Math.min(speed / 14, 2.2).toFixed(2)}px)` : '';
 };
 render(0);
 const easeOut = t => 1 - Math.pow(1 - t, 4);
 const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
 const spin = () => {
  const target = nextTarget();
  const distance = count * (2 + Math.floor(Math.random() * 2)) + ((index - target + count) % count);
  const overshoot = .2, spinTime = 1500, settleTime = 260;
  const start = performance.now();
  let last = start, lastValue = 0;
  const frame = now => {
   const elapsed = now - start;
   const value = elapsed < spinTime
    ? (distance + overshoot) * easeOut(elapsed / spinTime)
    : distance + overshoot * (1 - easeInOut(Math.min((elapsed - spinTime) / settleTime, 1)));
   const speed = Math.abs(value - lastValue) / Math.max(now - last, 1) * 1000;
   last = now; lastValue = value;
   render(index - value, speed);
   if (elapsed < spinTime + settleTime) { requestAnimationFrame(frame); return; }
   index = target;
   render(index);
   setTimeout(next, 2000);
  };
  requestAnimationFrame(frame);
 };
 const next = () => { if (document.hidden) setTimeout(next, 1000); else spin(); };
 if (!matchMedia('(prefers-reduced-motion: reduce)').matches) setTimeout(next, 2000);
}

// Keep each headline line on one line: if a line is wider than its column (long translations or wide fonts),
// shrink the headline just enough to fit, then re-centre the hero phone.
const rollerHeadline = document.querySelector('.roller-headline');
function fitRollerHeadline() {
 if (!rollerHeadline) return;
 rollerHeadline.style.setProperty('--headline-fit', '1');
 let ratio = 1;
 rollerHeadline.querySelectorAll('.headline-line').forEach(line => {
  const range = document.createRange();
  range.selectNodeContents(line);
  const need = range.getBoundingClientRect().width;
  if (need > line.clientWidth) ratio = Math.min(ratio, line.clientWidth / need);
 });
 if (ratio < 1) rollerHeadline.style.setProperty('--headline-fit', (ratio * .98).toFixed(3));
 alignHeroProduct();
}
fitRollerHeadline();
addEventListener('resize', fitRollerHeadline);
document.fonts?.ready.then(fitRollerHeadline);

// Share the gallery's measured outer frame width with the numbered guide.
const firstShowcasePhone = document.querySelector('#ride-showcase .showcase-phone');
if (firstShowcasePhone) {
 const syncShowcaseWidth = () => {
  const frame = firstShowcasePhone.getBoundingClientRect();
  root.style.setProperty('--showcase-phone-width', `${frame.width}px`);
  root.style.setProperty('--showcase-phone-height', `${frame.height}px`);
 };
 if ('ResizeObserver' in window) new ResizeObserver(syncShowcaseWidth).observe(firstShowcasePhone);
 addEventListener('resize', syncShowcaseWidth);
 syncShowcaseWidth();
}

// Continuously bounce the visible, loaded ride preview at 35 pixels per second.
function mountRideHistoryPreview() {
 const preview = document.querySelector('#ride-history .ride-image-scroll');
 if (!preview) return () => {};
 const image = preview.querySelector('img');
 if (!image) return () => {};
 const events = new AbortController();
 const listen = (target, type, handler) => target.addEventListener(type, handler, {signal: events.signal});
 let visible = false, frame = 0, last = 0, direction = 1;
 let position = preview.scrollTop, expected = position;
 preview.setAttribute('aria-label', preview.dataset.scrollLabel);
 preview.removeAttribute('aria-keyshortcuts');
 const eligible = () => visible && image.complete && image.naturalWidth > 0
  && !document.hidden && preview.scrollHeight > preview.clientHeight;
 const stop = () => {
  cancelAnimationFrame(frame);
  frame = 0; last = 0;
 };
 const schedule = () => {
  stop();
  position = preview.scrollTop;
  expected = position;
  if (eligible()) frame = requestAnimationFrame(tick);
 };
 function tick(now) {
  frame = 0;
  if (!eligible()) { stop(); return; }
  const limit = preview.scrollHeight - preview.clientHeight;
  const elapsed = last ? Math.min(now - last, 64) : 0;
  last = now;
  if (Math.abs(preview.scrollTop - expected) > .5) position = preview.scrollTop;
  const next = Math.max(0, Math.min(limit, position + direction * 35 * elapsed / 1000));
  position = next;
  preview.scrollTop = next;
  expected = preview.scrollTop;
  if ((direction > 0 && next >= limit) || (direction < 0 && next <= 0)) direction *= -1;
  frame = requestAnimationFrame(tick);
 }
 listen(image, 'load', schedule);
 listen(document, 'visibilitychange', schedule);
 listen(window, 'resize', schedule);
 const observer = new IntersectionObserver(entries => {
  visible = entries[0].isIntersecting;
  schedule();
 });
 observer.observe(preview);
 const resize = new ResizeObserver(schedule);
 resize.observe(preview); resize.observe(image);
 return () => { stop(); observer.disconnect(); resize.disconnect(); events.abort(); };
}
let unmountRideHistoryPreview = mountRideHistoryPreview();
addEventListener('pagehide', () => { unmountRideHistoryPreview(); });
addEventListener('pageshow', event => {
 if (event.persisted) unmountRideHistoryPreview = mountRideHistoryPreview();
});
