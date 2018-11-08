   "use strict";

(function() {

    var app = angular.module("app");
    
    app.component("notificationButton", {
            templateUrl: "app/notification/notifications_button.html",
            controllerAs: "notificationCtrl",
            controller:  "NotificationController",
            bindings:{
                classButton: '@',
                shouldGoToState: '='
            }
    });
})();