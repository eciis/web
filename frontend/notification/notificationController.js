"use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationController", function NotificationController(NotificationService, 
            AuthService, $state) {
        var notificationCtrl = this;

        notificationCtrl.user = AuthService.getCurrentUser();

        notificationCtrl.notifications = [];
        notificationCtrl.allNotifications = [];

        /** Add new notifications in array with unread notifications.
         *  This function is used by NotificationService, always that service receive new notification.
         * @param {Notification} notification The unread notification that should be added. 
         */ 
        notificationCtrl.addUnreadNotification = function addUnreadNotification(notification){
            notificationCtrl.notifications.push(notification);
        };

        notificationCtrl.markAsRead = function markAsRead(notification) {
            var promise = NotificationService.markAsRead(notification);
            return promise;
        };

        notificationCtrl.showNotifications = function showNotifications($mdMenu, $event) {
            const shouldGoToState = notificationCtrl.shouldGoToState || 
                                    notificationCtrl.notifications.length === 0;
            shouldGoToState ? notificationCtrl.seeAll(): $mdMenu.open($event);
        };

        notificationCtrl.clearAll = function clearAll() {
            _.forEach(notificationCtrl.notifications, function(notification) {
                notificationCtrl.markAsRead(notification);
            });
        };

        notificationCtrl.numberUnreadNotifications = function numberUnreadNotifications() {
            return notificationCtrl.notifications.length < 100 ?
                    notificationCtrl.notifications.length : "+99";
        };

        notificationCtrl.seeAll = function seeAll() {
            $state.go('app.user.notifications');
        };

        (function main(){
            notificationCtrl.allNotifications = NotificationService.getAllNotifications();
            notificationCtrl.notifications =  NotificationService.getUnreadNotifications();
        })();
    });
})();