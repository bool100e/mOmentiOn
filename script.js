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
 document.querySelector('meta[name="theme-color"]').content = dark ? '#1b1b1f' : '#ffffff';
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
if (!root.dataset.theme) root.dataset.theme = 'light';
const current = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.sidebar a,.nav-links a').forEach(a => { if (a.getAttribute('href') === current) { a.classList.add('active'); a.setAttribute('aria-current','page'); } });
translate();
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
const visibility = new Map();
const userPaused = new WeakSet();
const automaticPause = new WeakSet();
function syncVideos() {
 document.querySelectorAll('video').forEach(video => {
  if (document.hidden || !visibility.get(video)) {
   if (!video.paused) { automaticPause.add(video); video.pause(); }
  } else if (!reduceMotion.matches && !userPaused.has(video)) {
   video.play().catch(() => {}); // Native controls remain available when autoplay is blocked.
  }
 });
}
const observer = new IntersectionObserver(entries => {
 entries.forEach(entry => visibility.set(entry.target, entry.isIntersecting && entry.intersectionRatio >= .2));
 syncVideos();
}, {threshold:[0,.2]});
document.querySelectorAll('video').forEach(video => {
 video.muted = true;
 video.loop = true;
 video.addEventListener('pause', () => {
  if (automaticPause.has(video)) automaticPause.delete(video);
  else if (visibility.get(video) && !document.hidden) userPaused.add(video);
 });
 video.addEventListener('play', () => userPaused.delete(video));
 observer.observe(video);
});
document.addEventListener('visibilitychange', syncVideos);
reduceMotion.addEventListener('change', () => {
 if (reduceMotion.matches) document.querySelectorAll('video').forEach(v => { if (!v.paused) { automaticPause.add(v); v.pause(); } });
 else syncVideos();
});
