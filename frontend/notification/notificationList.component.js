"use strict";

(function() {

    var app = angular.module("app");

    var notificationComponentController = function(NotificationService, $state,
        RequestDialogService, NOTIFICATION_TYPE){

        const ctrl = this;

        const callback = {
            "showRequestDialog": showRequestDialog
        }

        ctrl.getIcon = function(type) {
            return NOTIFICATION_TYPE[type].icon;
        };

        /**
         * In case that notification had action, e.g. INVITE_USER, call showRequestDialog,
         *  otherwise if the notification didn't has action will go to notification page.
         * This function mark notification like read.
         * @param {object} notification - The notification that has or not action and will be mark as read.
         * @param {object} event
         */
        ctrl.action = function action(notification, event) {
            const properties = NOTIFICATION_TYPE[notification.entity_type].properties;
            const actionNotification = NOTIFICATION_TYPE[notification.entity_type].action;
            if (actionNotification){
                showRequestDialog(notification, event, properties, callback);
            } else {
                ctrl.goTo(notification);
            }
            ctrl.markAsRead(notification);
        };

        /**
         * Limit a string to quantity caracteres informed.
         * @param {string} string - The string that will be formatted.
         * @param {integer} value - Max length of formatted string.
         * @return {string} The formatted string.
         */
        ctrl.limitString = function limitString(string, value) {
            return Utils.limitString(string, value);
        };

        /**
         * Format the notification message according type and the institution(s) involved.
         * @param {object} notification - The notification will be formatted the message
         * @return {Point} The notification message.
         */
        ctrl.format = function format(notification) {
            return NotificationService.formatMessage(notification);
        };

        /**
         * Show dialogs to accept or reject requests or invites.
         * @param {object} notification - The notification with informations about invite or request.
         * @param {object} event
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
            var state = NOTIFICATION_TYPE[notification.entity_type].state;
            state && $state.go(state, {key: notification.entity.key});
            !state && $state.go('app.user.notifications');
        };
    }

    app.component("notificationList", {
        templateUrl: "app/notification/notifications_list.html",
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