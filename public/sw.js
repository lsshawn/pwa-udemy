let CACHE_STATIC_NAME = 'static-v9'
let CACHE_DYNAMIC_NAME = 'dynamic-v3'

self.addEventListener('install', function(event) {
  // console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    // Pre-caching
    caches.open(CACHE_STATIC_NAME) // any cache name. Use versioning forces a SW change, thus using a new cache.
    .then(function (cache) {
      console.log('[Service Worker] Precaching App Shell')
      // you're caching URLS for app shell
      cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
        '/src/js/app.js',
        '/src/js/feed.js',
        '/src/js/fetch.js',
        '/src/js/material.min.js',
        '/src/css/app.css',
        '/src/css/feed.css',
        '/src/images/main-image.jpg',
        'https://fonts.googleapis.com/css?family=Roboto:400,700',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
      ])
    })
  )
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          // clean up cache if cache name is not the latest
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache', key)
            return caches.delete(key)
          }
        }));
      })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // console.log('[Service Worker] Fetching something ....', event);
  event.respondWith(
    caches.match(event.request)
      .then(function (response) {
        if (response) {
          return response;
        // if we don't find the item in the cache
        } else {
          return fetch(event.request)
            .then(function (res) {
              // store into cache and return it to original response
              return caches.open(CACHE_DYNAMIC_NAME)
                .then(function (cache) {
                  cache.put(event.request.url, res.clone()) // response only can be used once, so you need to clone()
                  return res
                })
            })
            .catch(function (err) {
              // if page is not cached, show offline.html page
              return caches.open(CACHE_STATIC_NAME)
                .then((cache) => {
                  return cache.match('/offline.html')
                })
            })
        }
      })
  );
});
