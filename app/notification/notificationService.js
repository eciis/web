'use strict';

(function() {
    var app = angular.module("app");

    app.service("NotificationService", function NotificationService($firebaseArray, $mdToast) {
        var service = this;

        var ref = firebase.database().ref();

        var notifications;
        service.notificationList = [];
        service.refreshed = false;

        var msg = {
            'COMMENT': 'comentou o seu post',
            'POST': 'publicou um novo post',
            'INVITE': 'te enviou um novo convite'
        };

        var POST_NOTIFICATION = 'POST';

        service.watchNotifications = function watchNotifications(userKey, notificationsList) {
            service.refreshed = false;
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

        service.getPostNotification = function getPostNotification(userKey, showButton) {
            if(!notifications){
                var notificationsRef = ref.child("notifications/"+userKey);
                notifications = $firebaseArray(notificationsRef);
                notifications.$loaded();
            }
            notifications.$watch(function(ev) {
                var notification = notifications.$getRecord(ev.key);
                var typeCondition = false;
                var eventCondition = ev.event === "child_added";
                if(notification){
                    typeCondition = notification.type === POST_NOTIFICATION;
                }
                if(eventCondition && service.refreshed && typeCondition) {
                    showButton();
                }
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
                        notification.msg = msg[notification.type];
                        showToast(format(notification));
                    }
                }
            });
            setNotificationMsg(notificationsList);
            service.refreshed = true;
        }

        function setNotificationMsg(notificationsList) {
            _.forEach(notificationsList, function (notification) {
                notification.msg = msg[notification.type];
                notifications.$save(notification);
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
            return notification.from+" "+notification.msg;
        }
    });
})();