importScripts('workbox-sw.prod.v1.3.0.js');

const workboxSW = new self.WorkboxSW({
  "cacheId": "dev-mind",
  "clientsClaim": true
});
workboxSW.precache([]);

workboxSW.router.registerRoute('https://fonts.googleapis.com/(.*)',
  workboxSW.strategies.cacheFirst({
    cacheName: 'googleapis',
    cacheExpiration: {
      maxEntries: 20
    },
    cacheableResponse: {statuses: [0, 200]}
  })
);
// We want no more than 100 images in the cache. We check using a cache first strategy
workboxSW.router.registerRoute(/\.(?:png|gif|jpg)$/,
  workboxSW.strategies.cacheFirst({
    cacheName: 'images-cache',
    cacheExpiration: {
      maxEntries: 100
    }
  })
);
workboxSW.router.registerRoute('/(.*)',
  workboxSW.strategies.networkFirst({
    cacheName: 'general-cache',
    'cacheExpiration': {
      networkTimeoutSeconds: 3,
      maxAgeSeconds: 7200
    },
    broadcastCacheUpdate: {
      channelName: 'precache-updates'
    }
  }));