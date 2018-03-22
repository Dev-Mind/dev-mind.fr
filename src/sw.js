importScripts('workbox-sw.prod.js');

const workboxSW = new self.WorkboxSW({
  "cacheId": "solidarite-wassadou",
  "clientsClaim": true
});
workboxSW.precache([]);

workboxSW.router.registerRoute('https://cdn.polyfill.io/v2/polyfill.min.js',
    workboxSW.strategies.cacheFirst({
      cacheName: 'googleapis',
      cacheExpiration: {
        networkTimeoutSeconds: 3,
        maxEntries: 20
      },
      cacheableResponse: {statuses: [0, 200]}
    })
  );

workboxSW.router.registerRoute('https://fonts.googleapis.com/(.*)',
  workboxSW.strategies.cacheFirst({
    cacheName: 'googleapis',
    cacheExpiration: {
      networkTimeoutSeconds: 3,
      maxEntries: 20
    },
    cacheableResponse: {statuses: [0, 200]}
  })
);
// We want no more than 100 images in the cache. We check using a cache first strategy
workboxSW.router.registerRoute(/\.(?:png|gif|jpg)$/,
  workboxSW.strategies.networkFirst({
    cacheName: 'images-cache',
    cacheExpiration: {
      networkTimeoutSeconds: 3,
      maxEntries: 100
    }
  })
);
workboxSW.router.registerRoute('/(.*)',
  workboxSW.strategies.networkFirst({
    cacheName: 'general-cache',
    cacheExpiration: {
      networkTimeoutSeconds: 3,
      maxAgeSeconds: 7200
    },
    cacheableResponse: {statuses: [0, 200]},
    broadcastCacheUpdate: {
      channelName: 'precache-updates'
    }
  }));