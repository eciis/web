(function() {
    'use strict';

    const app = angular.module('app');

    app.service('PushNotificationService', function PushNotificationService($firebaseArray, 
        AuthService, $firebaseObject) {
        /**
         * Service responsible for send request permission
         * to enable notifications to the user and for deal
         * with the token resulted from this operation by saving
         * or updating it in firebase database.
         * Just in case the user is on a mobile device.
         */
        const service = this;
        
        /**
         * Retrieves the application instance of
         * firebase messaging.
         */
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

        /**
         * It is responsible for check if the user already have a token.
         * If it does, the token is replaced by the new one received as parameter.
         * Otherwise the token is saved.
         * @param {String} token 
         * @param notificationsRef 
         */
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