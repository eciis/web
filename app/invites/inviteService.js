'use strict';

(function() {
    var app = angular.module("app");

    app.service("InviteService", function InviteService($http, $q) {
        var service = this;

        var INVITES_URI = "/api/invites";

        service.getInvite = function(inviteKey) {
            var deferred = $q.defer();
            $http.get(INVITES_URI + '/' + inviteKey).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        service.sendInvite = function sendInvite(invite) {
            var deferred = $q.defer();
            $http.post(INVITES_URI, invite).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deleteInvite = function deleteInvite(inviteKey) {
            var deferred = $q.defer();
            $http.delete(INVITES_URI + '/' + inviteKey).then(function sucess(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getSentInstitutionInvitations = function getSentInstitutionInvitations() {
            var deferred = $q.defer();
            $http.get(INVITES_URI).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.updateInvite = function updateInvite(invite, newInvite) {
            var deffered = $q.defer();
            var patch = jsonpatch.compare(invite, newInvite);
            $http.patch(INVITES_URI + '/' + invite.key, patch).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };
    });
})();