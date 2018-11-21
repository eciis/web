"use strict";

(function() {

    var app = angular.module("app");

    var notificationComponentController = function(NotificationService, $state,
        RequestDialogService, NOTIFICATION_TYPE){

        const ctrl = this;

        /**
         * Return the icon according the notification type
         * @param {string} type - The notification type.
         * @return {string} name of icon
         */
        ctrl.getIcon = function(type) {
            return NOTIFICATION_TYPE[type].icon;
        };

        /**
         * Executes some action according to the notification type and mark notification as read.
         * If notification has action, should call showRequestDialog,
         * otherwise should go to notification state.
         * @param {object} notification - The notification that has or not action and will be mark as read.
         * @param {Event} event - MouseEvent
         */
        ctrl.action = function action(notification, event) {
            ctrl.markAsRead(notification);
            
            const properties = NOTIFICATION_TYPE[notification.entity_type].properties;
            const actionNotification = NOTIFICATION_TYPE[notification.entity_type].action;
            if (actionNotification){
                actionNotification.showDialog && showRequestDialog(notification, event, properties);
            } else {
                ctrl.goTo(notification);
            }
        };

        /**
         * Limit a string to quantity caracteres informed.
         * @param {string} string - The string that will be formatted.
         * @param {integer} value - Max length of formatted string.
         * @return {string} The formatted string.
         */
        ctrl.getLimitedString = function getLimitedString(string, value) {
            return Utils.limitString(string, value);
        };

        /**
         * Format the notification message according to the type and the institution(s) involved.
         * @param { object} notification - The notification that will have the message formatted
         * @return {string} The notification message.
         */
        ctrl.getFormattedMessage = function getFormattedMessage(notification) {
            return NotificationService.formatMessage(notification);
        };

        /**
         * Show dialogs to accept or reject requests or invites.
         * @param {object} notification - The notification with informations about invite or request.
         * @param {Event} event - MouseEvent
         * @param {object} properties - The properties necessaries to open dialog, e.g. path of controller and html.
         */
        function showRequestDialog(notification, event, properties) {
            RequestDialogService.showRequestDialog(notification, event, properties);
        }

        /**
         * Redirect to state of notification, if exists, if not redirect to notification page
         * @param {string} notification - The notification that contains state to redirect or not.
         */
        ctrl.goTo = function goTo(notification) {
            const state = NOTIFICATION_TYPE[notification.entity_type].state;
            state && $state.go(state, {key: notification.entity.key});
            !state && $state.go('app.user.notifications');
        };
    };

    app.component("notificationList", {
        templateUrl: Utils.selectFieldBasedOnScreenSize(
            "app/notification/notifications_list.html", 
            "app/notification/notifications_list_mobile.html",
            600
        ),
        bindings: {
            lengthTextNotification: '=?',
            notifications: '=',
            markAsRead: '=',
            keyword: '=?'
        },
        controller: ["NotificationService", "$state", "RequestDialogService",
                        "NOTIFICATION_TYPE", notificationComponentController],
        controllerAs: 'notificationListCtrl'
    });
})();