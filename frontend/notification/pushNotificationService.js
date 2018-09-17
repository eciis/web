(function() {
    'use strict';

    const app = angular.module('app');

    app.service('PushNotificationService', function PushNotificationService($firebaseArray, AuthService, $rootScope) {
        const service = this;

        const messaging = firebase.messaging();

        console.log("oi");

        const ref = firebase.database().ref();

        service.firebaseArrayNotifications;

        service.currentUser = AuthService.getCurrentUser();

        function requestPermission() {
            messaging.requestPermission().then(() => {
                messaging.getToken().then(token => {
                    console.log('aeee');
                    saveToken(token);
                });
            });
        }

        function saveToken(token) {
            if (!service.firebaseArrayNotifications) {
                const notificationsRef = ref.child("pushNotifications/" + service.currentUser.key);
                service.firebaseArrayNotifications = $firebaseArray(notificationsRef);
            }
            service.firebaseArrayNotifications.$save(token);
        }

        function hasPermission() {
            const { permission } = Notification;
            return permission === "granted";
        }

        (function init() {
            console.log("oi");
            if(!hasPermission()) {
                console.log("oi");
                requestPermission();
            }
        })();
    });
})();