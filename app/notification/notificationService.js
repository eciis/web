'use strict';

(function() {
    var app = angular.module("app");

    app.service("NotificationService", function NotificationService($firebaseArray,  MessageService) {
        var service = this;

        var ref = firebase.database().ref();

        var firebaseArrayNotifications;

        var TRANSLATE_MESSAGE = {
            'COMMENT': 'comentou o seu post',
            'POST': 'publicou um novo post',
            'INVITE': 'te enviou um novo convite'
        };

        var POST_NOTIFICATION = 'POST';
        var CHILD_ADDED = "child_added";

        service.formatMessage = function formatMessage(notification) {
            var message = TRANSLATE_MESSAGE[notification.type];
            return notification.from+" "+message;
        };

        service.watchNotifications = function watchNotifications(userKey, notificationsList) {
            setupNotifications(userKey, function() {
                _.forEach(firebaseArrayNotifications, function each(notification) {
                    if (isNew(notification)) {
                        notificationsList.push(notification);
                    }
                });

                firebaseArrayNotifications.$watch(function(ev) {
                    if (ev.event === CHILD_ADDED) {
                        var notification = firebaseArrayNotifications.$getRecord(ev.key);
                        notificationsList.push(notification);

                        if (isNew(notification)) {
                            MessageService.showToast(service.formatMessage(notification));
                        }
                    }
                });
            });
        };

        service.watchPostNotification = function watchPostNotification(userKey, callback) {
            setupNotifications(userKey, function() {
                firebaseArrayNotifications.$watch(function(ev) {
                    if (ev.event === CHILD_ADDED) {
                        var notification = firebaseArrayNotifications.$getRecord(ev.key);
                        if (notification.type === POST_NOTIFICATION) {
                            callback();
                        }
                    }
                });
            });
        };

        service.markAsRead = function markAsRead(notification) {
            notification.status = "READ";
            return firebaseArrayNotifications.$save(notification);
        };

        function setupNotifications(userKey, callback) {
            var notificationsRef = ref.child("notifications/"+userKey);
            firebaseArrayNotifications = $firebaseArray(notificationsRef);
            firebaseArrayNotifications.$loaded().then(function() {
                callback();
            });
        }

        function isNew(notification) {
            return notification.status === "NEW";
        }
    });
})();