// 서비스 워커 캐싱 전략
const CACHE_NAME = 'fuel-rack-v1.2';
const urlsToCache = [
  '/',
  '/index.html',
  // 필요한 다른 정적 자원들
];

self.addEventListener('install', function(event) {
  console.log('Service Worker 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('캐시가 열렸습니다.');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('모든 리소스가 캐시되었습니다.');
        return self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker 활성화됨');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('이전 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('이 Service Worker가 모든 클라이언트를 제어합니다.');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // HTML 페이지 요청에 대한 네트워크 우선 전략
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 기타 요청에 대한 캐시 우선 전략
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 캐시가 있으면 캐시 반환, 없으면 네트워크 요청
        return response || fetch(event.request);
      })
  );
});
