(function () {
    'use strict';

    importScripts('https://www.gstatic.com/firebasejs/5.4.2/firebase-app.js');
    importScripts('https://www.gstatic.com/firebasejs/5.4.2/firebase-messaging.js');
    importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.4.1/workbox-sw.js');
    importScripts('app/firebase-config.js');
    importScripts('app/config.js');

    let messaging;

    function setupFirebase() {
        firebase.initializeApp(FIREBASE_CONFIG);
        messaging = firebase.messaging();
    };

    workbox.core.setCacheNameDetails({
        prefix: 'plataforma-cis',
        suffix: 'v1'
    });

    const precacheCacheName = workbox.core.cacheNames.precache;
    const runtimeCacheName = workbox.core.cacheNames.runtime;

    async function addToCache(urls) {
        const myCache = await caches.open(precacheCacheName);
        await myCache.addAll(urls);
    }

    workbox.routing.registerRoute(
        ({ event }) => event.request.mode === 'navigate',
        ({ url }) => fetch(url.href).catch(() => caches.match('/'))
    );

    workbox.routing.registerRoute(
        /\.(?:png|gif|jpg|jpeg|svg)$/,
        workbox.strategies.cacheFirst({
        cacheName: 'images',
        plugins: [
            new workbox.expiration.Plugin({
            maxEntries: 60,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
            }),
        ],
        })
    );

    workbox.routing.registerRoute(
        /\.(?:js|css|html)$/,
        workbox.strategies.staleWhileRevalidate({
            cacheName: precacheCacheName,
        })
    );

    workbox.routing.registerRoute(
        new RegExp(Config.BACKEND_URL),
        workbox.strategies.networkFirst({
            cacheName: runtimeCacheName
        })
    );

    (function initSw() {
        self.skipWaiting();
        setupFirebase();
        addToCache(['/']);
    })();
})();