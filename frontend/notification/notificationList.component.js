"use strict";

(function() {

    var app = angular.module("app");

    var notificationCtrlComponent = function(NotificationService, $state,
        RequestDialogService, typeNotification){

        var ctrl = this;

        ctrl.getIcon = function(type) {
            return typeNotification[type].icon;
        };

        ctrl.action = function action(notification, event) {
            var properties = typeNotification[notification.entity_type].properties;
            var actionNotification = typeNotification[notification.entity_type].action;
            if (actionNotification){
                actionNotification(notification, event, properties);
            } else {
                goTo(notification);
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

        function goTo(notification) {
            var state = typeNotification[notification.entity_type].state;
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
                        "typeNotification", notificationCtrlComponent],
        controllerAs: 'ctrl'
    });
})();