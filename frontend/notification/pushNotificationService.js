(function() {
    'use strict';

    const app = angular.module('app');

    app.service('PushNotificationService', function PushNotificationService($firebaseArray, 
        $firebaseObject, $q, AuthService ) {
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
        const messaging = ("Notification" in window) ? firebase.messaging() : null;

        const ref = firebase.database().ref();
        
        const PUSH_NOTIFICATIONS_URL = "pushNotifications/";

        service.firebaseArrayNotifications;

        /**
         * Setup necessary properties as:
         *   Initilize firebase array with user's device tokens.
         */
        service.setupPushNotificationPermission = () => {
            service._initFirebaseArray();
        };

        /**
         * Check if the user has blocked push notification in the browser for this application.
         * @returns {boolean} True if is blocked, false otherwise
         */
        service.isPushNotificationBlockedOnBrowser = function isPushNotificationBlockedOnBrowser() {
            const { permission } = Notification;
            return permission === "denied";
        };

        /**
         * Check if the user has already allowed push Notification in this application
         * @returns {Promise<Boolean>} True if notification is active, false otherwise
         */
        service.isPushNotificationActive = function () {
            return service._getTokenObjectInFirebaseArray().then((tokenObject) => {
                return !!tokenObject;
            });
        };

        /**
         * Unsubscribe User for push notification in current device.
         * @return {Promise}
         */
        service.unsubscribeUserNotification = () => {
            return service._removeTokenFromFirebaseArray();
        };

        /**
         * Remove the current device token from firebase array, blocking the device from
         * receive push notifications.
         * @returns {Promise}
         * @private
         */
        service._removeTokenFromFirebaseArray = () => {
            return service._getTokenObjectInFirebaseArray().then((tokenObject) => {
                tokenObject && service.firebaseArrayNotifications.$remove(tokenObject);
            });
        };

        /**
         * Subscribe User for push notification in current device.
         * * @return {Promise}
         */
        service.subscribeUserNotification = () => {
            return service._requestNotificationPermission();
        };

        /**
         * Ask permission to the user to send push notifications
         * and if the permission is conceded the user's new token
         * is retrieved and saveToken is called passing the token
         * as parameter.
         */
        service._requestNotificationPermission = function requestNotificationPermission() {
            if (messaging && !service.isPushNotificationBlockedOnBrowser()) {
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
            const endPoint =  `${PUSH_NOTIFICATIONS_URL}${AuthService.getCurrentUser().key}`;
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
         * Look for firebase object, in firebase array, corresponding to the current device token.
         * @returns {Promise<FirebaseObject|undefined>}
         * @private
         */
        service._getTokenObjectInFirebaseArray = () => {
             return messaging && messaging.getToken().then((deviceToken) => {
                return service.firebaseArrayNotifications.$loaded().then((updatedArray) => {
                    let tokenObject;
                    updatedArray.map((objectToken) => {
                        if (objectToken.token === deviceToken){
                            tokenObject = objectToken;
                        }
                    });
                    return tokenObject;
                });
            });
        };
    });
})();