   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationController", function NotificationController(NotificationService, AuthService, $state) {
        var controller = this;

        controller.user = AuthService.getCurrentUser();

        controller.notifications = [];

        var TYPE_COMMENT = "COMMENT";

        controller.markAsRead = function markAsRead(notification) {
            var promise = NotificationService.markAsRead(notification);
            promise.then(function success() {
                _.remove(controller.notifications, function find(found) {
                    return found.$id === notification.$id;
                });
            });
            return promise;
        };

        controller.goToPost = function goToPost(notification) {
            if(notification.type === TYPE_COMMENT){
                $state.go('app.post', {postKey: notification.entity_key});
            }
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