(function() {
    'use strict';

    const app = angular.module('app');

    app.service('PushNotificationService', function PushNotificationService($firebaseArray, 
        AuthService, $firebaseObject, MessageService) {
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

        /**
         * Ask permission to the user to send push notifications
         * and if the permission is conceded the user's new token
         * is retrieved and saveToken is called passing the token
         * as parameter.
         * @private
         */
        service._requestNotificationPermission = function requestNotificationPermission() {
            messaging.requestPermission().then(() => {
                messaging.getToken().then(token => {
                    service._saveToken(token);
                }, () => {
                    MessageService.showToast('Não foi possível ativar as notificações.');
                });
            });
        };

        /**
         * It receives a token, starts a reference to
         * firebase's database and save the token.
         * @param {String} token
         * @private 
         */
        service._saveToken = function saveToken(token) {
            const notificationsRef = service._initFirebaseArray();
            service._setToken(token, notificationsRef);
        };

        /**
         * Instantiate a reference to the database
         * based on the userKey, starts a firebaseArray
         * in case of it hasn't been started before, and
         * return the reference.
         * @private
         */
        service._initFirebaseArray = function initFirebaseArray() {
            const endPoint = `${PUSH_NOTIFICATIONS_URL}${service.currentUser.key}`;
            const notificationsRef = ref.child(endPoint);

            if (!service.firebaseArrayNotifications) {
                service.firebaseArrayNotifications = $firebaseArray(notificationsRef);
            }

            return notificationsRef;
        };

        /**
         * It is responsible for check if the user already have a token.
         * If it does, the token is replaced by the new one received as parameter.
         * Otherwise the token is saved.
         * @param {String} token 
         * @param notificationsRef
         * @private 
         */
        service._setToken = function setToken(token, notificationsRef) {
            service.firebaseArrayNotifications.$loaded().then(() => {
                const tokenObject = $firebaseObject(notificationsRef);
                tokenObject.token = token;
                service.firebaseArrayNotifications.$add(tokenObject);
            });
        };

        /**
         * Check if the user has already conceded the permission
         * using Notification object.
         * @private
         */
        service._hasNotificationPermission = function hasNotificationPermission() {
            const { permission } = Notification;
            return permission === "granted";
        };

        (function init() {
            if (!service._hasNotificationPermission() && isMobile.any()) {
                service._requestNotificationPermission();
            }
        })();
    });
})();