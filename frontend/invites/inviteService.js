'use strict';

(function() {
    var app = angular.module("app");

    app.service("InviteService", function InviteService($http, $q, AuthService) {
        var service = this;

        var INVITES_URI = "/api/invites";
        service.user = AuthService.getCurrentUser();
    
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
            var body = Utils.createBody(invite, service.user.current_institution);
            var deferred = $q.defer();
            $http.post(INVITES_URI, body).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.sendInviteInst = function sendInviteInst(invite) {
            var body = Utils.createBody(invite, service.user.current_institution);
            var deferred = $q.defer();
            $http.post(INVITES_URI + '/institution', body).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deleteInvite = function deleteInvite(inviteKey) {
            var currentInstitution = Utils.currentInstitutionToString(service.user.current_institution);
            var deferred = $q.defer();
            $http.delete(`${INVITES_URI}/${inviteKey}?currentInstitution=${currentInstitution}`).then(function sucess(response) {
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

        service.acceptInvite = function acceptInvite(patch, invite_key) {
            var currentInstitution = Utils.currentInstitutionToString(service.user.current_institution);
            var deffered = $q.defer();
            $http.patch(`${INVITES_URI}/${invite_key}?currentInstitution=${currentInstitution}`, patch).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };
    });
})();