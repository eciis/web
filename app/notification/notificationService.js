'use strict';

(function() {
    var app = angular.module("app");

    app.service("NotificationService", function NotificationService($firebaseArray, $mdToast) {
        var service = this;

        var ref = firebase.database().ref();

        var notifications;
        var notificationList = [];
        var postNotification = [];

        var msg = {
            'COMMENT': 'comentou o seu post',
            'POST': 'publicou um novo post',
            'INVITE': 'te enviou um novo convite'
        };

        var POST_NOTIFICATION = 'POST';
        var REFRESHED_NOTIFICATION = 'REFRESHED';

        service.watchNotifications = function watchNotifications(userKey, notificationsList) {
            var notificationsRef = ref.child("notifications/"+userKey);
            notifications = $firebaseArray(notificationsRef);
            notifications.$loaded().then(function() {
                _.forEach(notifications, function each(notification) {
                    if (isNew(notification)) {
                        notificationsList.push(notification);
                    }
                });
                notificationList = notificationsList;
                watch(notificationsList);
            });
        };

        service.setPostNotification = function setPostNotification(notificationsList, notificationChanged) {
           postNotification = _.map(notificationsList, function(notification) {
                if(notification.type === POST_NOTIFICATION && isNew(notification)){
                    return notification;
                }
            });
           if(!checkPostNotification() || notificationChanged){
                postNotification = [];
           }
        };

        function checkPostNotification() {
            return _.find(postNotification, {status: "NEW", type: POST_NOTIFICATION});
        }

        service.markAsRefreshed = function markAsRefreshed() {
            _.forEach(postNotification, function (notification) {
                if(notification){
                    if(notification.type === POST_NOTIFICATION){
                        notification.status = REFRESHED_NOTIFICATION;
                        notifications.$save(notification);
                    }
                }
            });
        };

        service.getPostNotification = function getPostNotification(userKey) {
            if(!notifications){
                var notificationsRef = ref.child("notifications/"+userKey);
                notifications = $firebaseArray(notificationsRef);
                notifications.$loaded();
            }
            notifications.$watch(function(ev) {
                if(ev.event === "child_added") {
                    service.setPostNotification(notificationList, false);
                } else if (ev.event === "child_changed") {
                    service.setPostNotification(notificationList, true);
                }
            });
            return postNotification;
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
                        notificationList = notificationsList;
                        showToast(format(notification));
                    }
                }
            });
            setNotificationMsg(notificationsList);
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