(function() {
    'use strict';

    var support = angular.module("support");

    support.service("UserService", function UserService(HttpService, $q) {
        var service = this;

        var USER_URI = "/api/user";

        service.load = function load() {
            return HttpService.get(USER_URI);
        };
    });
})();