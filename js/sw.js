let staticCacheName = 'restaurant-reviews-v2';

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches
            .open(staticCacheName)
            .then(
                function(cache) {
                    return cache.addAll([
                        'https://fonts.googleapis.com/css?family=Open+Sans:300,600',
                        '/',
                        '/index.html',
                        '/restaurant.html',
                       /* '/css/',*/
                        '/css/styles.css',
                /*       '/data/',*/
                        '/data/restaurants.json',
                   /*     '/js/',*/
                        '/js/idb.js',
                        '/js/dbhelper.js',
                        '/js/main.js',
                        '/js/restaurant_info.js',
              /*          '/images_src/',*/
                        '/images_src/emily.jpg',
                        '/images_src/emily_medium.jpg',
                        '/images_src/casaenrique.jpg',
                        '/images_src/casaenrique_medium.jpg',
                        '/images_src/hometownbbq.jpg',
                        '/images_src/hometownbbq_medium.jpg',
                        '/images_src/kanghodongbaekjeong.jpg',
                        '/images_src/kanghodongbaekjeong_medium.jpg',
                        '/images_src/katzsdelicatessen.jpg',
                        '/images_src/katzsdelicatessen_medium.jpg',
                        '/images_src/missionchinesefood.jpg',
                        '/images_src/missionchinesefood_medium.jpg',
                        '/images_src/muramen.jpg',
                        '/images_src/muramen_medium.jpg',
                        '/images_src/muramen_medium.jpg',
                        '/images_src/robertaspizza.jpg',
                        '/images_src/robertaspizza_medium.jpg',
                        '/images_src/superiorityburger.jpg',
                        '/images_src/superiorityburger_medium.jpg',
                        '/images_src/thedutch.jpg',
                        '/images_src/thedutch_medium.jpg',
                  /*      '/images_src/fixed/',*/
                        '/images_src/fixed/logo.svg', 
                  /*      '/manifest.json',*/
                        '/?utm_source=homescreen',
                        '/404.html'
                    ]);
                }
            )
            .then(
                function() {
                    return new Promise((resolve) => setTimeout(
                        function() {
                            console.log(`installation complete: ${(new Date()).toString()}`);
                            resolve();
                        },
                        10000));
                }
            )
    )
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('restaurant-reviews-') &&
                        cacheName != staticCacheName;
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

addEventListener('fetch', event => {
  // Permite al navegador hacer este asunto por defecto
  // para peticiones non-GET.
  /*if (event.request.method != 'GET') return;*/


if (event.request.method === 'GET') {
  /*  event.respondWith(
      caches.match(event.request)
      .then((cached) => {
        var networked = fetch(event.request)
          .then((response) => {
            let cacheCopy = response.clone()
            caches.open(staticCacheName)
              .then(cache => cache.put(event.request, cacheCopy))
            return response;
          })
          .catch(() => caches.match(offlinePage));
        return cached || networked;
      })
    )*/
     event.respondWith(caches.match(event.request).then(function (cached) {//search the cache
        if (cached !== undefined) {
            return cached; //Got it from cache, return it immediatelly!
        } else {
            return fetch(event.request).then(function (res) { // not in cache, fetch it
                var responseClone = res.clone(); // clone the response
                caches.open(staticCacheName).then(function (cache) {
                    cache.put(event.request, responseClone); // add it to cache
                });
                return res; // return it
            });
        }
    }));
  }







  // Evita el valor predeterminado, y manejar solicitud nosostros mismos.
  event.respondWith(async function() {
    // Intenta obtener la respuesta de el cache.
    const cache = await caches.open('dynamic-v1');
    const cachedResponse = await cache.match(event.request);

    if (cachedResponse) {
      // Si encontramos una coincidencia en el cache, lo devuelve, pero también
      // actualizar la entrada en el cache en segundo plano.
      event.waitUntil(cache.add(event.request));
      return cachedResponse;
    }

    // Si no encontramos una coincidencia en el cache, usa la red.
    return fetch(event.request);
  }());
});