importScripts('workbox-sw.js');


/**
 * Service worker version is injected by gulp
 */
var actualVersion = $serviceWorkerVersion || 2;


if (workbox) {
  //workbox.setConfig({debug: true})

  workbox.core.setCacheNameDetails({prefix: 'dev-mind', suffix: 'v' + actualVersion});
  workbox.precaching.precacheAndRoute([]);

  // Cache the underlying font files with a cache-first strategy for 1 year.
  workbox.routing.registerRoute(
    /^https:\/\/fonts\.gstatic\.com/,
    new workbox.strategies.CacheFirst(
      {
        cacheName: 'google-fonts-webfonts',
        plugins: [
          new workbox.cacheableResponse.Plugin({statuses: [0, 200]}),
          new workbox.expiration.Plugin({maxAgeSeconds: 60 * 60 * 24 * 365, maxEntries: 30})
        ],
      })
  );


  workbox.routing.registerRoute(
    /\.(?:png|gif|jpg|jpeg|webp)$/,
    new workbox.strategies.CacheFirst(
      {
        cacheName: 'images-v' + actualVersion,
        networkTimeoutSeconds: 3,
        plugins: [
          new workbox.expiration.Plugin({maxEntries: 60, maxAgeSeconds: 6 * 60 * 60, purgeOnQuotaError: true})
        ]
      })
  );

  workbox.routing.registerRoute(
    /\.(?:svg)$/,
    new workbox.strategies.CacheFirst(
      {
        cacheName: 'images-svg-v' + actualVersion,
        networkTimeoutSeconds: 3,
        plugins: [
          new workbox.expiration.Plugin({maxEntries: 60, maxAgeSeconds: 6 * 60 * 60, purgeOnQuotaError: true})
        ]
      })
  );

  // use a stale while revalidate for CSS and JavaScript files that aren't precached.
  workbox.routing.registerRoute(
    /\.(?:js)$/,
    new workbox.strategies.StaleWhileRevalidate(
      {
        cacheName: 'static-resources-v' + actualVersion,
        networkTimeoutSeconds: 3,
        plugins: [
          new workbox.expiration.Plugin({maxAgeSeconds: 60 * 60 * 24, maxEntries: 30})
        ]
      })
  );

  // use a stale while revalidate for CSS and JavaScript files that aren't precached.
  workbox.routing.registerRoute(
    /\.(?:css)$/,
    new workbox.strategies.StaleWhileRevalidate(
      {
        cacheName: 'static-resources-css-v' + actualVersion,
        networkTimeoutSeconds: 3,
        plugins: [
          new workbox.expiration.Plugin({maxAgeSeconds: 60 * 60 * 24, maxEntries: 10})
        ]
      })
  );

  workbox.routing.registerRoute(
    /\.(?:html)$/,
    new workbox.strategies.NetworkFirst(
      {
        cacheName: 'html-resources-v' + actualVersion,
        networkTimeoutSeconds: 1,
        plugins: [
          new workbox.expiration.Plugin({maxEntries: 60, maxAgeSeconds: 30 * 60})
        ]
      })
  );
} else {
  console.error('Error on workbox initialization');
}

// While self.skipWaiting() can be called at any point during the service worker's execution, it will only have an effect if there's a newly installed service worker that might otherwise remain in the waiting state. Therefore, it's common to
self.skipWaiting();
