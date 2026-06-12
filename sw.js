// Grand Tour 2026 — Service Worker
// 전략: HTML(내비게이션)은 network-first(온라인이면 항상 최신, 오프라인이면 캐시),
//       라이브러리/정적 자산은 cache-first. 외부 API/지도는 캐시하지 않고 네트워크로.
// index.html 수정 시 버전을 올릴 필요 없음(navigation이 network-first라 자동 최신).
// 단, 이 sw.js 자체를 바꿀 때만 CACHE 버전을 올린다.

const CACHE = 'grandtour-v6';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  'https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/7.23.6/babel.min.js',
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
  'https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css',
  'https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&display=swap',
];

// 일정 사진·도시 히어로 CDN — 한 번 본 사진은 오프라인(기내·로밍 끊김)에서도 보이도록 런타임 캐시
const IMG_HOSTS = ['images.unsplash.com', 'upload.wikimedia.org'];

// 느린 네트워크(로밍·기내 와이파이)에서 부팅이 하염없이 걸리지 않도록
// 이 시간 안에 HTML 응답이 없으면 캐시본으로 즉시 부팅 (fetch는 계속 진행돼 다음 부팅용 캐시 갱신)
const NAV_TIMEOUT_MS = 3500;

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

  // HTML 내비게이션: network-first + 타임아웃 레이스
  if (req.mode === 'navigate' || req.destination === 'document') {
    const network = fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put('./index.html', copy));
      return res;
    });
    // 타임아웃으로 캐시본을 먼저 내보내도 fetch는 완주시켜 캐시를 갱신
    event.waitUntil(network.then(() => {}, () => {}));
    event.respondWith(
      Promise.race([
        network.catch(() => null),
        new Promise((resolve) => setTimeout(resolve, NAV_TIMEOUT_MS, null)),
      ]).then((res) =>
        res ||
        caches.match('./index.html')
          .then((r) => r || caches.match('./'))
          .then((r) => r || network) // 캐시조차 없으면(최초 방문) 네트워크 결과에 맡김
      )
    );
    return;
  }

  // 라이브러리/정적: cache-first (있으면 캐시, 없으면 네트워크 후 캐시)
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req)
        .then((res) => {
          const isImgHost = IMG_HOSTS.indexOf(url.hostname) !== -1;
          const cacheable =
            res &&
            ((res.status === 200 &&
              (url.origin === self.location.origin ||
               url.hostname.indexOf('cdnjs.cloudflare.com') !== -1 ||
               url.hostname.indexOf('cdn.jsdelivr.net') !== -1 ||
               url.hostname.indexOf('fonts.googleapis.com') !== -1 ||
               url.hostname.indexOf('fonts.gstatic.com') !== -1)) ||
             // 사진 CDN은 opaque(no-cors) 응답도 허용 — crossOrigin 누락 이미지 대비
             (isImgHost && (res.status === 200 || res.type === 'opaque')));
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
