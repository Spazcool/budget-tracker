const FILES_TO_CACHE = [
  // '/',
  'index.html',
  'styles.css',
  'bootstrap.min.css',
  'manifest.webmanifest',
  'index.js',
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

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
          console.log('Removing old cache data', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
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

// self.addEventListener('message', event => {
//   // event is an ExtendableMessageEvent object
//   console.log(`The client sent me a message:`);
//   console.log(event.data)

//   event.source.postMessage("Hi client");
// });

// self.onsync = (event) => {
//   if(event.tag == 'add-later') {
//     console.log('????')
//     console.log(event)
//     event.waitUntil(sendTransaction(true));
//   }
// }

// function sendToServer(){
//   fetch("/api/transaction")
//   .then(response => {
//     return response.json();
//   })
//   .then(data => {
//     // save db data on global variable
//     transactions = data;

//     populateTotal();
//     populateTable();
//     populateChart();
//   });
// }

// function store(){
//   var newPost = ""; // Inputted values
//   // Iterate through the inputs
//   $("input").each(function() {
//       newPost += $(this).val() + ",";
//   });
//   // Get rid of the last comma
//   newPost = newPost.substr(0, newPost.length - 1);
//   // Store the data
//   localStorage.setItem('newPost', newPost);
// }