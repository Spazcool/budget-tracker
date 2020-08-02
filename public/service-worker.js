const FILES_TO_CACHE = [
  '/',
  'index.html',
  'index.js',
  'db.js',
  'styles.css',
  'bootrap.min.css',
  'bootrap.min.js',
  'images/icons/icon-192x192.png',
  'images/icons/icon-512x512.png',
  'manifest.webmanifest'
];

const CACHE_NAME = 'static-cache-v1';
const DATA_CACHE_NAME = 'data-cache-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              return caches.delete(key);
            }
          })
        );
      })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if(event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(event.request)
          .then((response) => {
            if (response.status === 200){
              cache.put(event.request.url, response.clone());
            }
            return response;
          })
          .catch((err) => {
            return cache.match(event.request);
          });
        })
    );
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.match(event.request)
          .then((response) => {
            return response || fetch(event.request);
          });
      })
  );
});
