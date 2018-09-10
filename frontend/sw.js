'use strict';

importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/4.8.1/firebase-messaging.js');
importScripts('app/firebase-config.js');

firebase.initializeApp(FIREBASE_CONFIG);

const messaging = firebase.messaging();
console.log(messaging);

const askForPermissionToReceiveNotifications = async () => {
    try {
        await messaging.requestPermission();
        const token = await messaging.getToken();
        console.log('token do usuário:', token);

        return token;
    } catch (error) {
        console.error(error);
    }
}


const STATIC_CACHE_NAME = "static-v3";
const DATA_CACHE_NAME = "data-v3";

const files = [
    '/',
    '/app/app.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(caches.open(STATIC_CACHE_NAME).then(function(cache) {
        console.log('service worker installed');
        return cache.addAll(files);
    }));
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keyList) {
            return Promise.all(keyList.map((key) => {
                if (key !== STATIC_CACHE_NAME && key !== DATA_CACHE_NAME) {
                    console.log("removing cache");
                    return caches.delete(key);
                }
            }));
        })
    );
});


self.addEventListener('fetch', function(event) {
    const dataUrl = 'http://localhost:8082/api/';

    if (event.request.url.startsWith(dataUrl)) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(function(cache) {
                return fetch(event.request).then(function(response) {
                    cache.put(event.request.url, response.clone());
                    return response;
                }).catch(function() {
                    return caches.match(event.request).then(function(response) {
                        return response;
                    });
                });
            })
        );
    } else {
        event.respondWith(caches.match(event.request).then(function (response) {
            return response || fetch(event.request).then(function (response) {
                return caches.open(STATIC_CACHE_NAME).then(function(cache) {
                    cache.put(event.request.url, response.clone());
                    return response;
                });
            });
        }));
    }
});