'use strict';
const tabs = Array.from(document.querySelectorAll('[role="tab"]'));
function activate(tab, focus = false) {
  tabs.forEach(item => {
    const selected = item === tab;
    item.setAttribute('aria-selected', String(selected));
    item.tabIndex = selected ? 0 : -1;
    document.getElementById(item.getAttribute('aria-controls')).hidden = !selected;
  });
  if (focus) tab.focus();
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => activate(tab));
  tab.addEventListener('keydown', event => {
    let next;
    if (event.key === 'ArrowRight') next = tabs[(index + 1) % tabs.length];
    if (event.key === 'ArrowLeft') next = tabs[(index + tabs.length - 1) % tabs.length];
    if (event.key === 'Home') next = tabs[0];
    if (event.key === 'End') next = tabs[tabs.length - 1];
    if (next) { event.preventDefault(); activate(next, true); }
  });
});

const koreanText = new Map();
const translations = new Map([
  ['본문으로 건너뛰기', 'Skip to content'], ['기능', 'Features'], ['사용 가이드', 'How it works'], ['다운로드', 'Download'],
  ['움직임을 따라.\n기록은 자연스럽게.', 'Move.\nRecord. Relive.'],
  ['출발하면 녹화를 시작하고, 정차하면 마무리합니다. 달려온 길과 그 순간의 속도를 mOmentiOn으로 돌아보세요.', 'Start moving and recording begins. Stop, and the ride is wrapped up. Relive your route and speed with mOmentiOn.'],
  ['시작하기 ↗', 'Get started ↗'], ['기록 화면 살펴보기 ↓', 'Explore the app ↓'],
  ['Android 10 이상 · Google Play 비공개 테스트 진행 중', 'Android 10+ · Google Play closed testing'],
  ['속도에 맞춘 자동 녹화', 'Automatic recording on the move'],
  ['설정한 속도에 도달하면 녹화를 시작하고,\n정차하면 마무리합니다.', 'Recording starts at your chosen speed\nand finishes when you stop.'],
  ['자동 녹화', 'Auto record'], ['주행 기록', 'Ride history'], ['히트맵 분석', 'Heatmap'], ['경로 비교', 'Compare'], ['실제 mOmentiOn 앱 화면', 'Real mOmentiOn app screens'],
  ['주행에 맞춰,\n녹화도 자동으로.', 'Your ride moves.\nRecording follows.'],
  ['시작·정지 속도와 유지 시간을 설정하면 GPS 속도 조건에 따라 연결된 카메라의 녹화를 제어합니다.', 'Set start and stop speeds, and mOmentiOn controls the connected camera using GPS speed.'],
  ['주행 경로와 속도를\n한 화면에서.', 'Route and speed,\ntogether.'], ['이동 경로, 시간, 거리와 속도 변화를 함께 확인합니다.', 'Review your route, time, distance, and speed in one place.'],
  ['길 위의 변화를\n이어 봅니다.', 'See how every\nmoment connects.'], ['히트맵 위치와 그래프 값을 맞춰 보며 주행 흐름을 살펴보세요.', 'Match heatmap positions with graph values to understand the flow of your ride.'],
  ['같은 길,\n다른 순간.', 'Same road.\nDifferent moments.'], ['여러 경로의 속도와 경과 시간을 한 화면에서 비교합니다.', 'Compare speed and elapsed time across multiple rides.'],
  ['주행 전부터, 돌아온 뒤까지.', 'Built around every ride.'],
  ['기억하는 카메라 연결', 'Camera connection that recovers'], ['주변 Wi-Fi 목록에서 카메라를 선택하고 연결 정보를 저장합니다. 연결이 끊기면 자동으로 재연결을 시도합니다.', 'Save your camera connection once. If it drops, mOmentiOn automatically attempts to reconnect.'],
  ['길 위의 순간을 GPX로', 'Every ride, saved as GPX'], ['이동 경로와 속도를 기록하고, 속도별 히트맵으로 확인하세요. 기록한 경로를 확대하고 회전하며 살펴볼 수 있습니다.', 'Record route and speed, then explore the ride as a speed heatmap.'],
  ['경로를 나란히 비교', 'Compare rides side by side'], ['여러 기록의 속도와 경과 시간을 비교합니다. 경로별 표시를 선택하고 그래프를 확대해 차이를 확인하세요.', 'Compare speed and elapsed time across rides, with selectable routes and zoomable graphs.'],
  ['기록을 이미지와 영상으로', 'Share images and videos'], ['경로 요약 이미지를 공유하고, 히트맵 재생을 영상으로 저장합니다. 히트맵만 또는 그래프를 포함한 출력을 선택하세요.', 'Share route summaries and export animated heatmaps with or without graphs.'],
  ['사용자가 선택한 저장 위치', 'You choose where files live'], ['GPX, 로그, 공유 결과물을 선택한 폴더에 보관하세요. 소중한 경로는 잠금으로 보호할 수 있습니다.', 'Keep GPX files, logs, and exports in a folder you choose.'],
  ['첫 주행 준비,\n네 단계면 됩니다.', 'Ready for your first ride\nin four steps.'], ['카메라와 휴대폰을 연결한 뒤\n원하는 녹화 조건을 설정하세요.', 'Connect your camera and phone, then choose your recording conditions.'],
  ['권한과 저장 폴더 설정', 'Set permissions and storage'], ['앱의 권한 안내에 따라 필요한 권한을 허용하고 기록을 보관할 폴더를 선택합니다.', 'Allow the required permissions and choose a folder for your recordings.'],
  ['카메라 연결', 'Connect the camera'], ['카메라 Wi-Fi를 켜고 앱 설정에서 카메라 종류, SSID와 비밀번호를 확인합니다.', 'Turn on camera Wi-Fi and confirm the camera type, SSID, and password.'],
  ['자동 녹화 조건 설정', 'Set automatic recording'], ['녹화 시작·정지 속도와 유지 시간을 정합니다. 출발 전 GPS와 카메라 연결 상태를 확인하세요.', 'Choose start and stop speeds, then check GPS and camera status before departure.'],
  ['기록 확인과 공유', 'Review and share'], ['주행 후 경로 목록에서 기록을 열어 히트맵을 확인하고 이미지 또는 영상으로 공유합니다.', 'Open a saved ride, inspect its heatmap, and share it as an image or video.'],
  ['mOmentiOn을 먼저 경험해 보세요.', 'Take mOmentiOn for a ride.'], ['현재 Google Play 비공개 테스트를 진행하고 있습니다.\n테스터 등록에 사용한 Google 계정으로 참여한 뒤 앱을 설치할 수 있습니다.', 'mOmentiOn is currently in Google Play closed testing.\nJoin with your registered tester account, then install the app.'],
  ['Google Play에서 설치 ↗', 'Install on Google Play ↗'], ['테스터 신청하기 ↗', 'Join the test ↗'],
  ['Android 10 이상 · 비공개 테스트 참여 승인이 필요합니다.\n카메라 지원 범위는 모델과 펌웨어에 따라 달라질 수 있습니다.', 'Android 10+ · Closed-test approval required.\nCamera support may vary by model and firmware.'],
  ['문제 제보 ↗', 'Report an issue ↗'], ['사이트 소스 ↗', 'Site source ↗']
]);

const textNodes = [];
const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
  acceptNode(node) { return node.parentElement?.closest('script, style') || !node.nodeValue.trim() ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT; }
});
while (walker.nextNode()) {
  const node = walker.currentNode;
  const normalized = node.nodeValue.replace(/\s+/g, ' ').trim();
  koreanText.set(node, node.nodeValue);
  textNodes.push({ node, normalized });
}

const elementTranslations = [
  ['.links a', ['Features', 'How it works', 'GitHub ↗', 'Download']],
  ['.hero-copy > .eyebrow', ['<span></span> SPEED-TRIGGERED REMOTE RECORDING']],
  ['.hero h1', ['Let Your Speed<br><em>Control the Camera.</em>']],
  ['.hero .intro', ['Ride naturally while mOmentiOn automatically starts and stops<br class="desktop"> recording on your action camera based on your speed.']],
  ['.hero .actions a', ['Get started <span>↗</span>', 'Explore the app <span>↓</span>']],
  ['.hero .availability', ['Android 10+ <span>·</span> Google Play closed testing']],
  ['#preview .section-heading h2', ['Automatic recording on the move']],
  ['#preview .section-heading > p', ['Recording starts at your chosen speed,<br>then finishes when you stop.']],
  ['.preview-tabs button', ['Auto record', 'Ride history', 'Heatmap', 'Compare']],
  ['.window-bar .sample', ['Real mOmentiOn app screens']],
  ['.showcase-copy h3', ['Let Your Speed<br>Control the Camera.', 'Route and speed,<br>together.', 'See how every<br>moment connects.', 'Same road.<br>Different moments.']],
  ['.showcase-copy > p:last-child', ['Ride naturally while mOmentiOn automatically starts and stops recording on your action camera based on your speed.', 'Review your route, time, distance, and speed in one place.', 'Match heatmap positions with graph values to understand the flow of your ride.', 'Compare speed and elapsed time across multiple rides.']],
  ['#features .section-heading h2', ['Built around every ride.']],
  ['.feature-grid article h3', ['Automatic recording on the move', 'Camera connection that recovers', 'Every ride, saved as GPX', 'Compare rides side by side', 'Share images and videos', 'You choose where files live']],
  ['.feature-grid article p', ['Set your start and stop speeds. mOmentiOn controls the connected camera using GPS speed.', 'Save your camera connection once. If it drops, mOmentiOn automatically attempts to reconnect.', 'Record route and speed, then explore the ride as a speed heatmap.', 'Compare speed and elapsed time across rides with selectable routes and zoomable graphs.', 'Share route summaries and export animated heatmaps with or without graphs.', 'Keep GPX files, logs, and exports in a folder you choose.']],
  ['#guide h2', ['Ready for your first ride,<br>in four steps.']],
  ['#guide .guide-grid > div > p:last-child', ['Connect your camera and phone,<br>then choose your recording conditions.']],
  ['#guide li h3', ['Set permissions and storage', 'Connect the camera', 'Set automatic recording', 'Review and share']],
  ['#guide li p', ['Allow the required permissions and choose a folder for your recordings.', 'Turn on camera Wi-Fi and confirm the camera type, SSID, and password.', 'Choose start and stop speeds, then check GPS and camera status before departure.', 'Open a saved ride, inspect its heatmap, and share it as an image or video.']],
  ['#download h2', ['Take mOmentiOn for a ride.']],
  ['#download > p:not(.eyebrow):not(.download-note)', ['mOmentiOn is currently in Google Play closed testing.<br>Join with your registered tester account, then install the app.']],
  ['#download .actions a', ['Install on Google Play ↗', 'Join the test ↗']],
  ['#download .download-note', ['Android 10+ · Closed-test approval required.<br>Camera support may vary by model and firmware.']],
  ['footer div a', ['Report an issue ↗', 'Site source ↗']]
];
const localizedElements = [];
elementTranslations.forEach(([selector, englishValues]) => {
  document.querySelectorAll(selector).forEach((element, index) => localizedElements.push({ element, korean: element.innerHTML, english: englishValues[index] }));
});

function setLanguage(language) {
  const english = language === 'en';
  document.documentElement.lang = language;
  document.title = english ? 'mOmentiOn — A Moment in Motion' : 'mOmentiOn — 움직임을 기록하다';
  document.querySelector('meta[name="description"]').content = english
    ? 'Automatic action-camera recording triggered by motion, with GPX route tracking, heatmaps, and ride comparison.'
    : '속도 기반 카메라 자동 녹화부터 GPX 주행 기록, 히트맵과 경로 비교까지. Android 주행 기록 앱 mOmentiOn.';
  textNodes.forEach(({ node, normalized }) => {
    if (!english) { node.nodeValue = koreanText.get(node); return; }
    const translated = translations.get(normalized);
    if (translated) {
      const leading = node.nodeValue.match(/^\s*/)?.[0] || '';
      const trailing = node.nodeValue.match(/\s*$/)?.[0] || '';
      node.nodeValue = leading + translated + trailing;
    }
  });
  localizedElements.forEach(item => { item.element.innerHTML = english ? item.english : item.korean; });
  document.querySelectorAll('[data-language]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.language === language)));
  document.querySelector('header nav').setAttribute('aria-label', english ? 'Main navigation' : '주 메뉴');
}

document.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => setLanguage(button.dataset.language)));
setLanguage('en');
