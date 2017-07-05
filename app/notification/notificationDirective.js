   "use strict";

(function() {

    var app = angular.module("app");

    app.controller("NotificationDirective", function NotificationDirective(NotificationService, AuthService, $rootScope) {
        var controller = this;

        Object.defineProperty(controller, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        controller.notifications = [];

        controller.markAsRead = function markAsRead(notification) {
            var promise = NotificationService.markAsRead(notification);
            promise.then(function success() {
                _.remove(controller.notifications, function find(found) {
                    return found.$id === notification.$id;
                });
            });
            return promise;
        };

        $rootScope.$on("user_loaded", function() {
            NotificationService.watchNotifications(controller.user.key, controller.notifications);
        });
    });

    app.directive("notification", function() {
        return {
            restrict: 'E',
            templateUrl: "notification/notifications.html",
            controllerAs: "controller",
            controller: "NotificationDirective"
        };
    });
})();