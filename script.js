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
const autoplayVideos = [...document.querySelectorAll('video')];
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
