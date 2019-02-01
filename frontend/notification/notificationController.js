"use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationController", function NotificationController(NotificationService, 
            AuthService, $state, STATES) {
        var notificationCtrl = this;

        notificationCtrl.user = AuthService.getCurrentUser();

        notificationCtrl.notifications = [];
        notificationCtrl.allNotifications = [];

        notificationCtrl.markAsRead = function markAsRead(notification) {
            return NotificationService.markAsRead(notification);
        };

        notificationCtrl.showNotifications = function showNotifications($mdMenu, $event) {
            const shouldGoToState = notificationCtrl.shouldGoToState || 
                                    notificationCtrl.notifications.length === 0;
            shouldGoToState ? notificationCtrl.seeAll(): $mdMenu.open($event);
        };

        notificationCtrl.clearAll = function clearAll() {
            NotificationService.markAllAsRead();
        };

        notificationCtrl.numberUnreadNotifications = function numberUnreadNotifications() {
            return notificationCtrl.notifications.length < 100 ?
                    notificationCtrl.notifications.length : "+99";
        };

        notificationCtrl.seeAll = function seeAll() {
            $state.go(STATES.NOTIFICATION);
        };

        notificationCtrl.isMobileScreen = (mobileScreenSize) => {
            return Utils.isMobileScreen(mobileScreenSize);
        };

        const items = [];

        function getMobileToolbarMenuItems() {

            items.push({
                options: ['Todas as notificações', 'Notificações Institucionais', 'Notificações não lidas', 'Marcar todas como lidas'],
                action: option => {},
                title: 'NOTIFICAÇÕES'
            });

            return items;
        };

        notificationCtrl.tst = getMobileToolbarMenuItems();

        (function main(){
            notificationCtrl.allNotifications = NotificationService.getAllNotifications();
            notificationCtrl.notifications =  NotificationService.getUnreadNotifications();
        })();
    });
})();