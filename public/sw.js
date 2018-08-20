let CACHE_STATIC_NAME = 'static-v13'
let CACHE_DYNAMIC_NAME = 'dynamic-v13'

let STATIC_FILES = [
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
]

function trimCache(cacheName, maxItems) {
  caches.open(cacheName)
    .then((cache) => {
      return cache.keys()
        .then((keys) => {
          if (keys.length > maxItems) {
            cache.delete(keys[0])
              .then(trimCache(cacheName, maxItems))
          }
        })
    })
}

self.addEventListener('install', function(event) {
  // console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    // Pre-caching
    caches.open(CACHE_STATIC_NAME) // any cache name. Use versioning forces a SW change, thus using a new cache.
    .then(function (cache) {
      console.log('[Service Worker] Precaching App Shell')
      // you're caching URLS for app shell
      cache.addAll(STATIC_FILES)
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

// helper function
function isInArray (str, array) {
  for (var i = 0; i < array.length; i++) {
    if (array[i] === str) {
      return true
    }
  }
  return false
}

// cache then network
self.addEventListener('fetch', function(event) {
  let url = 'https://httpbin.org/get'

  // only use this strategy for this URL.
  // different caching strategy for different URL
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then((cache) => {
          // intercept fetch request in all other JS files.
          return fetch(event.request)
            .then((res) => {
                
              cache.put(event.request, res.clone())
              return res
            })
        })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request)
    );
  } else {
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
                  trimCache(CACHE_DYNAMIC_NAME, 3)
                  cache.put(event.request.url, res.clone()) // response only can be used once, so you need to clone()
                  return res
                })
            })
            .catch(function (err) {
              // if page is not cached, show offline.html page
              return caches.open(CACHE_STATIC_NAME)
                .then((cache) => {
                  if (event.request.headers.get('accept').includes('text/html')) {
                    return cache.match('/offline.html')
                  }
                })
            })
        }
      })
    )
  }
});

// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//     .then(function (response) {
//       if (response) {
//         return response;
//         // if we don't find the item in the cache
//       } else {
//         return fetch(event.request)
//           .then(function (res) {
//             // store into cache and return it to original response
//             return caches.open(CACHE_DYNAMIC_NAME)
//               .then(function (cache) {
//                 cache.put(event.request.url, res.clone()) // response only can be used once, so you need to clone()
//                 return res
//               })
//           })
//           .catch(function (err) {
//             // if page is not cached, show offline.html page
//             return caches.open(CACHE_STATIC_NAME)
//               .then((cache) => {
//                 return cache.match('/offline.html')
//               })
//           })
//       }
//     })
//   );
// });

// Strategy: cache only. Rarely used. Good only for selected assets
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Strategy: network only. Don't use Service Worker at all.
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//       .then((res) => {
//         return caches.open(CACHE_DYNAMIC_NAME)
//           .then((cache) => {
//             cache.put(event.request.url, res.clone())
//             return res
//           })
//       })
//       .catch((err) => {
//         return caches.match(event.request)
//       })
//   );
// });

// Strategy (Not the best): network first, cache later strategy
// self.addEventListener('fetch', function(event) {
//   // console.log('[Service Worker] Fetching something ....', event);
//   event.respondWith(
//     fetch(event.request)
//       .catch((err) => {
//         return caches.match(event.request)
//       })
//     )
// });

// Strategy (best): cache then network
// self.addEventListener('fetch', (event) => {
//   caches.open(CACHE_DYNAMIC_NAME)
//     .then((cache) => {
//       return fetch(event.request)
//         .then((res) => {
//           cache.put(event.request, res.clone())
//           return res
//         })
//     })
// }) 