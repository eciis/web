(function() {
    'use strict';

    const app = angular.module('app');

    app.service('PushNotificationService', function PushNotificationService($firebaseArray, 
        $firebaseObject, $q) {
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
        
        /**
         * @private
         */
        service._isMobile = {
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
                return (
                    service._isMobile.Android() || 
                    service._isMobile.BlackBerry() || 
                    service._isMobile.iOS() || 
                    service._isMobile.Opera() || 
                    service._isMobile.Windows()
                );
            }
        };

        service.firebaseArrayNotifications;

        /**
         * Ask permission to the user to send push notifications
         * and if the permission is conceded the user's new token
         * is retrieved and saveToken is called passing the token
         * as parameter.
         */
        service.requestNotificationPermission = function requestNotificationPermission(user) {
            service.currentUser = user;
            const isOnMobile = service._isMobile.any();
            if (!service._hasNotificationPermission() && isOnMobile) {
                return messaging.requestPermission().then(() => {
                    return messaging.getToken().then(token => {
                        service._saveToken(token);
                    });
                }).catch(() => {
                    return $q.when();
                });
            }

            return $q.when();
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
         * @param {object} notificationsRef
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
    });
})();