'use strict';

(function() {
    var app = angular.module("app");

    app.service("InviteService", function InviteService($http, $q, HttpService, AuthService) {
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
            $http.post(INVITES_URI, {
                data: invite
            }).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };


        service.acceptInviteUserAdm = function acceptInviteUserAdm(inviteKey) {
            return HttpService.put(INVITES_URI + '/' + inviteKey + '/institution_adm');
        };

        service.rejectInviteUserAdm = function rejectInviteUserAdm(inviteKey) {
            return HttpService.delete(INVITES_URI + '/' + inviteKey + '/institution_adm');
        };

        service.resendInvite = function resendInvite(inviteKey) {
            var deferred = $q.defer();
            $http.post(INVITES_URI + "/" + inviteKey + "/resend", {}).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.sendInviteInst = function sendInviteInst(invite) {
            var deferred = $q.defer();
            $http.post(INVITES_URI + '/institution', {
                data: invite
            }).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deleteUserInvite = function deleteUserInvite(inviteKey) {
            var deferred = $q.defer();
            var url = `${INVITES_URI}/user/${inviteKey}`;
            $http.delete(url).then(function sucess(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deleteInstitutionInvite = function deleteInstitutionInvite(inviteKey) {
            var deferred = $q.defer();
            var url = `${INVITES_URI}/institution/${inviteKey}`;
            $http.delete(url).then(function sucess(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
        

        service.getSentInstitutionInvitations = function getSentInstitutionInvitations() {
            var deferred = $q.defer();
            $http.get(INVITES_URI + '/institution').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.acceptUserInvite = function acceptUserInvite(patch, invite_key) {
            var deffered = $q.defer();
            var url = `${INVITES_URI}/user/${invite_key}`;
            $http.patch(url, patch).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.sendInviteHierarchy = function sendInviteHierarchy(invite) {
            var deferred = $q.defer();
            HttpService.post(INVITES_URI + '/institution_hierarchy', {
                data: invite
            }).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.sendInviteUser = function sendInvite(invite) {
            var deferred = $q.defer();
            HttpService.post(INVITES_URI + '/user', {
                data: invite
            }).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();