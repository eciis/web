(function() {
    'use strict';

    var app = angular.module("app");

    app.service("UserService", function UserService(HttpService) {
        var service = this;
        var USER_URI = "/api/user";

        service.load = function load() {
            return HttpService.get(USER_URI);
        };
    });
})();