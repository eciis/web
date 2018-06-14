'use strict';

(function() {
    var app = angular.module("app");

    app.service("UserService", function UserService($http, $q) {
        var service = this;

        var USER_URI = "/api/user";

        service.NOTIFICATIONS_TO_UPDATE_USER = ["DELETED_INSTITUTION", "DELETE_MEMBER", "ACCEPT_INSTITUTION_LINK"];

        service.deleteAccount = function deleteAccount() {
            var deffered = $q.defer();
            $http.delete(USER_URI).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.save = function save(patch) {
            patch = JSON.parse(angular.toJson(patch));
            var deffered = $q.defer();
            $http.patch(USER_URI, patch).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.getUser = function getUser(userKey) {
            var deffered = $q.defer();
            $http.get(USER_URI + "/" + userKey + "/profile").then(function loadUser(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.load = function load() {
            var deffered = $q.defer();
            $http.get(USER_URI).then(function loadUser(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.deleteInstitution = function deleteInstitution(institution_key) {
            var deffered = $q.defer();
            $http.delete(USER_URI + '/institutions/' + institution_key + '/institutional-operations').then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };
    });
})();