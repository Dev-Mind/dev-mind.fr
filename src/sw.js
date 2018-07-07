importScripts('workbox-sw.js');

if (workbox) {
    workbox.core.setCacheNameDetails({
        prefix: 'dev-mind',
        suffix: 'v1'
    });

    workbox.precaching.precacheAndRoute([]);

    workbox.routing.registerRoute(
        new RegExp('https://fonts.(?:googleapis|gstatic).com/(.*)'),
        workbox.strategies.cacheFirst({
            cacheName: 'googleapis',
            networkTimeoutSeconds: 3,
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 30,
                    purgeOnQuotaError:true
                })
            ]
        })
    );

    workbox.routing.registerRoute(
        /\.(?:png|gif|jpg|jpeg|svg|webp)$/,
        workbox.strategies.cacheFirst({
            cacheName: 'images',
            networkTimeoutSeconds: 3,
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 60,
                    maxAgeSeconds: 6 * 60 * 60,
                    purgeOnQuotaError:true
                })
            ]
        })
    );

    // use a stale while revalidate for CSS and JavaScript files that aren't precached.
    workbox.routing.registerRoute(/\.(?:html|js|css)$/, workbox.strategies.staleWhileRevalidate({
            cacheName: 'static-resources',
            networkTimeoutSeconds: 3,
            plugins: [
                new workbox.expiration.Plugin({
                    maxEntries: 60,
                    maxAgeSeconds: 60 * 60
                })
            ]
        })
    );

}
else{
    console.error('Error on workbox initialization');
}