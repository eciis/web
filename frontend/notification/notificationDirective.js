   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationController", function NotificationController(NotificationService, AuthService, $state) {
        var notificationCtrl = this;

        notificationCtrl.user = AuthService.getCurrentUser();

        notificationCtrl.notifications = [];
        notificationCtrl.allNotifications = [];

        notificationCtrl.addUnreadNotification = function addUnreadNotification(notification){
            notificationCtrl.push(notification);
        };

        notificationCtrl.markAsRead = function markAsRead(notification) {
            var promise = NotificationService.markAsRead(notification);
            promise.then(function success() {
                _.remove(notificationCtrl.notifications, function find(found) {
                    return found.$id === notification.$id;
                });
            });
            return promise;
        };

        notificationCtrl.showNotifications = function showNotifications($mdMenu, $event) {
            if(notificationCtrl.actionButton){
                notificationCtrl.actionButton();
            } else{
                const hasUnreadNotifications = notificationCtrl.notifications.length > 0;
                hasUnreadNotifications ? $mdMenu.open($event) : notificationCtrl.seeAll();
            }
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

        notificationCtrl.refreshUser = function refreshUser() {
            AuthService.reload();
        };

        (function main() {
            NotificationService.watchNotifications(notificationCtrl.user.key, notificationCtrl.addUnreadNotification);
            notificationCtrl.allNotifications = NotificationService.getAllNotifications();
        })();
    });

    app.directive("notification", function() {
        return {
            restrict: 'E',
            templateUrl: "app/notification/notifications.html",
            controllerAs: "notificationCtrl",
            controller: "NotificationController",
            bindToController:{
                'actionButton': '=?'
            }
        };
    });
})();