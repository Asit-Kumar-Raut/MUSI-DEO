const CACHE_NAME = 'musi-deo-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/logo.png',
  '/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', event => {
  // Pass non-GET requests or streaming/API traffic straight to the network
  if (
    event.request.method !== 'GET' || 
    event.request.url.includes('/api/') || 
    event.request.url.includes('.mp3') || 
    event.request.url.includes('.mp4') ||
    event.request.url.includes('saavncdn.com') ||
    event.request.url.includes('wikimedia.org')
  ) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
