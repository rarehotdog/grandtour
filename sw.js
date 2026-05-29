// Grand Tour 2026 — Service Worker
// 전략: HTML(내비게이션)은 network-first(온라인이면 항상 최신, 오프라인이면 캐시),
//       라이브러리/정적 자산은 cache-first. 외부 API/지도는 캐시하지 않고 네트워크로.
// index.html 수정 시 버전을 올릴 필요 없음(navigation이 network-first라 자동 최신).
// 단, 이 sw.js 자체를 바꿀 때만 CACHE 버전을 올린다.

const CACHE = 'grandtour-v3';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.6/babel.min.js',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css',
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      // 하나가 실패해도 설치 자체는 진행되도록 allSettled
      Promise.allSettled(PRECACHE.map((url) => cache.add(url)))
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Push notification handler (Web Push API — requires VAPID + server for true background push)
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(data.title || '🌙 Grand Tour · 오늘의 질문', {
      body: data.body || '일정 앱을 열어 오늘의 질문을 확인하세요.',
      icon: './manifest.webmanifest',
      badge: './manifest.webmanifest',
      tag: 'gt-daily-question',
      renotify: true,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow('./'));
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  let url;
  try { url = new URL(req.url); } catch (e) { return; }

  // 외부 API/지도는 캐시하지 않고 기본 네트워크 처리에 맡긴다
  const passthrough = ['er-api.com', 'open-meteo.com', 'openstreetmap.org', 'google.com'];
  if (passthrough.some((h) => url.hostname.indexOf(h) !== -1)) return;

  // HTML 내비게이션: network-first
  if (req.mode === 'navigate' || req.destination === 'document') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put('./index.html', copy));
          return res;
        })
        .catch(() => caches.match('./index.html').then((r) => r || caches.match('./')))
    );
    return;
  }

  // 라이브러리/정적: cache-first (있으면 캐시, 없으면 네트워크 후 캐시)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const cacheable =
            res && res.status === 200 &&
            (url.origin === self.location.origin ||
             url.hostname.indexOf('cdnjs.cloudflare.com') !== -1 ||
             url.hostname.indexOf('cdn.jsdelivr.net') !== -1 ||
             url.hostname.indexOf('fonts.googleapis.com') !== -1 ||
             url.hostname.indexOf('fonts.gstatic.com') !== -1);
          if (cacheable) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
          }
          return res;
        })
        .catch(() => cached);
    })
  );
});
