"use strict";

(function() {

    var app = angular.module("app");

    var notificationCtrlComponent = function(NotificationService, $state,
        RequestDialogService, NOTIFICATION_TYPE){

        var ctrl = this;

        var callback = {
            "showRequestDialog": showRequestDialog
        }

        ctrl.getIcon = function(type) {
            return NOTIFICATION_TYPE[type].icon;
        };

        ctrl.action = function action(notification, event) {
            var properties = NOTIFICATION_TYPE[notification.entity_type].properties;
            var actionNotification = NOTIFICATION_TYPE[notification.entity_type].action;
            if (actionNotification){
                showRequestDialog(notification, event, properties, callback);
            } else {
                ctrl.goTo(notification);
            }
            ctrl.markAsRead(notification);
        };

        ctrl.limitString = function limitString(string, value) {
            return Utils.limitString(string, value);
        };

        ctrl.format = function format(notification) {
            return NotificationService.formatMessage(notification);
        };

        function showRequestDialog(notification, event, properties) {
            RequestDialogService.showRequestDialog(notification, event, properties);
        }

        ctrl.goTo = function goTo(notification) {
            var state = NOTIFICATION_TYPE[notification.entity_type].state;
            state && $state.go(state, {key: notification.entity.key});
            !state && $state.go('app.user.notifications');
        };
    }

    app.component("notificationList", {
        templateUrl: "app/notification/notifications_list.html",
        bindings: {
            lengthTextNotification: '=',
            notifications: '=',
            markAsRead: '=',
            keyword: '='
        },
        controller: ["NotificationService", "$state", "RequestDialogService",
                        "NOTIFICATION_TYPE", notificationCtrlComponent],
        controllerAs: 'ctrl'
    });
})();