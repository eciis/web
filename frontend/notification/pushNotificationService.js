(function() {
    'use strict';

    const app = angular.module('app');

    app.service('PushNotificationService', function PushNotificationService($firebaseArray, 
        AuthService, $firebaseObject) {
        const service = this;

        const messaging = firebase.messaging();

        const ref = firebase.database().ref();

        const PUSH_NOTIFICATIONS_URL = "pushNotifications/";

        const isMobile = {
            Android: () => {
                return navigator.userAgent.match(/Android/i);
            },
            BlackBerry: () => {
                return navigator.userAgent.match(/BlackBerry/i);
            },
            iOS: () => {
                return navigator.userAgent.match(/iPhone|iPad|iPod/i);
            },
            Opera: () => {
                return navigator.userAgent.match(/Opera Mini/i);
            },
            Windows: () => {
                return navigator.userAgent.match(/IEMobile/i);
            },
            any: () => {
                return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
            }
        };

        service.firebaseArrayNotifications;

        service.currentUser = AuthService.getCurrentUser();

        function requestPermission() {
            messaging.requestPermission().then(() => {
                messaging.getToken().then(token => {
                    saveToken(token);
                });
            });
        }

        function saveToken(token) {
            const notificationsRef = initFirebaseArray();
            setToken(token, notificationsRef);
        }

        function initFirebaseArray() {
            const endPoint = `${PUSH_NOTIFICATIONS_URL}${service.currentUser.key}`;
            const notificationsRef = ref.child(endPoint);

            if (!service.firebaseArrayNotifications) {
                service.firebaseArrayNotifications = $firebaseArray(notificationsRef);
            }

            return notificationsRef;
        }

        function setToken(token, notificationsRef) {
            service.firebaseArrayNotifications.$loaded().then((data) => {
                let currentTokenObject = data[0];
                if (!currentTokenObject) {
                    const tokenObject = $firebaseObject(notificationsRef);
                    tokenObject.token = token;
                    service.firebaseArrayNotifications.$add(tokenObject);
                } else {
                    currentTokenObject.token = token;
                    service.firebaseArrayNotifications.$save(currentTokenObject);
                }
            });
        }

        function hasPermission() {
            const { permission } = Notification;
            return permission === "granted";
        }

        (function init() {
            if(!hasPermission() && isMobile.any()) {
                requestPermission();
            }
        })();
    });
})();