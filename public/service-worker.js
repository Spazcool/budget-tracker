const FILES_TO_CACHE = [
  // '/',
  'index.html',
  'styles.css',
  'bootstrap.min.css',
  'manifest.webmanifest',
  'index.js',
  'db.js',
  'bootstrap.min.js',
  './images/favicon.ico',
  './images/icons/icon-512x512.png',
];

const CACHE_NAME = 'static-cache-v8'; // the name of the cache we are going to use for storing our static assets
const DATA_CACHE_NAME = 'data-cache-v3'; // the name of the cache we are going to use for storing responses to API requests

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME)
    .then(cache => {cache.addAll(FILES_TO_CACHE)})
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  const currentCaches = [CACHE_NAME, DATA_CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return cacheNames.filter(cacheName => !currentCaches.includes(cacheName));
    }).then(cachesToDelete => {
      return Promise.all(cachesToDelete.map(cacheToDelete => {
        return caches.delete(cacheToDelete);
      }));
    }).then(() => self.clients.claim())
  );
});

//todo bug only fires on reload, initial load is not getting pushed to cache
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      caches.open(DATA_CACHE_NAME)
        .then(cache => {
          return fetch(event.request)
          .then(response => {
            if (response.status === 200) {
              cache.put(event.request.url, response.clone());
            }
            console.log('api response', response)
            return response;
          })
          .catch(err => {
              console.log('offline err: ', err);
              console.log('evt ', event.request)
              console.log('event', event)
              console.log('match', cache.match(event.request))
              // TODO HOW to grab the data being sent and push it into local storage
              // store();
              return cache.match(event.request);
          });
      }).catch(err => {
        console.log(err)
      })
    );
    return;
  }

  event.respondWith(caches.match(event.request).then((response) => {
    if (response !== undefined) { // no internet access
      return response;
    } else {
      return fetch(event.request).then((response) => { // internet access
        let responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(() => { // catch all?
        return caches.match('./index.html');
        // return fetch(event.request);
      });
    }
  }));
});