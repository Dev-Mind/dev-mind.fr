importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

/**
 * Service worker version is injected by gulp
 */
var actualVersion = $serviceWorkerVersion || 2;


if (workbox) {
  console.log('Devmind service worker version : ' + actualVersion);

  workbox.setConfig({debug: true});
  workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);
  workbox.precaching.cleanupOutdatedCaches();

  workbox.routing.registerRoute(
    ({url}) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
    new StaleWhileRevalidate({
      cacheName: 'google-fonts',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365 // 1 year
        }),
      ],
    })
  );


  workbox.routing.registerRoute(
    ({request}) => request.destination === 'image',
    new CacheFirst({
      cacheName: 'images-v' + actualVersion,
      networkTimeoutSeconds: 3,
      plugins: [
        new CacheableResponsePlugin({
          statuses: [0, 200],
        }),
        new ExpirationPlugin({
          maxEntries: 60,
          maxAgeSeconds: 24 * 60 * 60, // 1 Day
        }),
      ],
    })
  );

  // use a stale while revalidate for CSS and JavaScript files that aren't precached.
  workbox.routing.registerRoute(
    ({request}) => request.destination === 'script' || request.destination === 'style',
    new StaleWhileRevalidate({
      cacheName: 'static-resources-v' + actualVersion,
      plugins: [
        new ExpirationPlugin({
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 // 1 Day
        }),
      ],
    })
  );
} else {
  console.error('Error on workbox initialization');
}
