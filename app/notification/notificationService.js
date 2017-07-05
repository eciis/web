'use strict';

(function() {
    var app = angular.module("app");

    app.service("NotificationService", function NotificationService($firebaseArray, $mdToast) {
        var service = this;

        var ref = firebase.database().ref();

        var notifications;

        service.watchNotifications = function watchNotifications(userKey, notificationsList) {
            var notificationsRef = ref.child("notifications/"+userKey);

            notifications = $firebaseArray(notificationsRef);

            notifications.$loaded().then(function() {
                _.forEach(notifications, function each(notification) {
                    if (isNew(notification)) {
                        notificationsList.push(notification);
                    }
                });
                watch(notificationsList);
            });
        };

        service.markAsRead = function markAsRead(notification) {
            notification.status = "READ";
            return notifications.$save(notification);
        };

        function watch(notificationsList) {
            notifications.$watch(function(ev) {
                if (ev.event === "child_added") {
                    var notification = notifications.$getRecord(ev.key);
                    notificationsList.push(notification);

                    if (isNew(notification)) {
                        notification.type = notification.type === 'Comment'? 'comentou' : notification.type;
                        showToast(format(notification));
                    }
                }
            });
        }

        function showToast(msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        }

        function isNew(notification) {
            return notification.status === "NEW";
        }

        function format(notification) {
            return notification.from+" "+notification.type+" o seu post";
        }
    });
})();