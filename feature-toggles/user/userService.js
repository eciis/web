(function() {
    'use strict';

    var app = angular.module("app");

    app.service("UserService", function UserService(HttpService) {
        var service = this;

        var USER_URI = "/api/user";

        service.getUser = function getUser(userKey) {
            return HttpService.get(USER_URI + "/" + userKey + "/profile");
        };

        service.load = function load() {
            return HttpService.get(USER_URI);
        };
    });
})();