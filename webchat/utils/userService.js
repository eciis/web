'use strict';

(function() {
    const app = angular.module("webchat");

    app.service("UserService", function UserService(HttpService) {
        const service = this;

        const USER_URI = "/api/user";

        service.deleteAccount = function deleteAccount() {
            return HttpService.delete(USER_URI);
        };

        service.save = function save(patch) {
            patch = JSON.parse(angular.toJson(patch));
            return HttpService.patch(USER_URI, patch);
        };

        service.getUser = function getUser(userKey) {
            return HttpService.get(USER_URI + "/" + userKey + "/profile");
        };

        service.load = function load() {
            return HttpService.get(USER_URI);
        };
    });
})();
