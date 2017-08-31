   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationController", function NotificationController(NotificationService, AuthService, $state) {
        var controller = this;

        controller.user = AuthService.getCurrentUser();

        controller.notifications = [];

        var type_data = {
            "COMMENT": {
                icon: "comment",
                state: "app.post"
            },
            "POST": {
                icon: "inbox",
                state: "app.post"
            },
            "SHARED_POST": {
                icon: "inbox",
                state: "app.post"
            },
            "INVITE": {
                icon: "people",
                state: "new_invite"
            }
        };

        controller.markAsRead = function markAsRead(notification) {
            var promise = NotificationService.markAsRead(notification);
            promise.then(function success() {
                _.remove(controller.notifications, function find(found) {
                    return found.$id === notification.$id;
                });
            });
            return promise;
        };

        controller.getIcon = function getIcon(type) {
            var icon = type_data[type].icon;
            return icon;
        };

        controller.goTo = function goTo(notification) {
            var state = type_data[notification.type].state;
            $state.go(state, {key: notification.entity_key});
            controller.markAsRead(notification);
        };

        controller.format = function format(notification) {
            return NotificationService.formatMessage(notification);
        };

        (function main() {
            NotificationService.watchNotifications(controller.user.key, controller.notifications);
        })();
    });

    app.directive("notification", function() {
        return {
            restrict: 'E',
            templateUrl: "notification/notifications.html",
            controllerAs: "controller",
            controller: "NotificationController"
        };
    });
})();