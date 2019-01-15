'use strict';

(function() {
    const app = angular.module("webchat");

    app.service("UserService", ['HttpService', function UserService(HttpService) {
        const service = this;

        const USER_URI = "/api/user";

        service.getUser = function getUser(userKey) {
            return HttpService.get(USER_URI + "/" + userKey + "/profile");
        };

        service.load = function load() {
            return HttpService.get(USER_URI);
        };
    }]);
})();
