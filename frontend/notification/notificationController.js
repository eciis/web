"use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationController", function NotificationController(NotificationService, 
            AuthService, $state, STATES) {
        var notificationCtrl = this;

        const institutionalNotificationTypes = ['LEFT_INSTITUTION', 'DELETED_INSTITUTION', 
            'TRANSFER_ADM_PERMISSIONS', 'INVITE', 'REMOVE_INSTITUTION_LINK', 
            'REQUEST_INSTITUTION_CHILDREN', 'REQUEST_INSTITUTION_PARENT', 'REQUEST_INSTITUTION', 
            'ACCEPT_INSTITUTION_LINK', 'ACCEPTED_LINK', 'REJECTED_LINK', 
            'REJECT_INSTITUTION_LINK', 'ACCEPT_INVITE_INSTITUTION', 'REJECT_INVITE_INSTITUTION', 
            'ACCEPT_INVITE_HIERARCHY']

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

        notificationCtrl.selectNotificationAction = (option) => {
            const optionsMap = {
                'Todas as notificações': () => { notificationCtrl.notificationsToShow = notificationCtrl.allNotifications },
                'Notificações Institucionais': () => { 
                    notificationCtrl.notificationsToShow = notificationCtrl.allNotifications.filter(not => _.includes(institutionalNotificationTypes, not.entity_type))
                },
                'Notificações não lidas': () => { notificationCtrl.notificationsToShow = notificationCtrl.notifications },
                'Marcar todas como lidas': () => { notificationCtrl.clearAll() }
            }

            return optionsMap[option]();
        };

        const items = [];

        function getMobileToolbarMenuItems() {

            items.push({
                options: ['Todas as notificações', 'Notificações Institucionais', 'Notificações não lidas', 'Marcar todas como lidas'],
                action: option => {notificationCtrl.selectNotificationAction(option)},
                title: 'NOTIFICAÇÕES'
            });

            return items;
        };

        notificationCtrl.tst = getMobileToolbarMenuItems();

        (function main(){
            notificationCtrl.allNotifications = NotificationService.getAllNotifications();
            notificationCtrl.notifications =  NotificationService.getUnreadNotifications();
            notificationCtrl.notificationsToShow = notificationCtrl.allNotifications;
        })();
    });
})();