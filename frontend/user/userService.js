'use strict';

(function() {
    var app = angular.module("app");

    app.service("UserService", function UserService(HttpService, $q) {
        var service = this;

        var USER_URI = "/api/user";

        service.NOTIFICATIONS_TO_UPDATE_USER = ["DELETED_INSTITUTION", "DELETE_MEMBER", "ACCEPT_INSTITUTION_LINK"];

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

        service.deleteInstitution = function deleteInstitution(institution_key) {
            return HttpService.delete(USER_URI + '/institutions/' + institution_key + '/institutional-operations');
        };
    });
})();