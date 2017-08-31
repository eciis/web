'use strict';

(function() {
    var app = angular.module("app");

    app.service("UserService", function UserService($http, $q) {
        var service = this;

        var USER_URI = "/api/user";

        service.addInstitution = function addInstitution(user, institutionKey, inviteKey) {
            var deffered = $q.defer();
            user.addInstitution(institutionKey);

            $http.put(USER_URI + '/invites/' + inviteKey, user).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.deleteInstitution = function deleteInstitution(institutionKey) {
            var deffered = $q.defer();
            $http.delete(USER_URI + '/institutions/' + institutionKey).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.save = function save(patch) {
            var deffered = $q.defer();
            $http.patch(USER_URI, patch).then(function success(info) {
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
    });
})();