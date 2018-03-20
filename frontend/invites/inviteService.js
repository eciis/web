'use strict';

(function() {
    var app = angular.module("app");

    app.service("InviteService", function InviteService($http, $q, AuthService) {
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

        service.sendInviteUserAdm = function sendInviteUserAdm(invite) {
            var deferred = $q.defer();
            $http.post(INVITES_URI, {
                data: {invite_body: invite}
            }).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        service.acceptInviteUserAdm = function acceptInviteUserAdm(inviteKey) {
            var deferred = $q.defer();

            $http.put(INVITES_URI + '/' + inviteKey + '/institution_adm').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };

        service.rejectInviteUserAdm = function acceptInviteUserAdm(inviteKey) {
            var deferred = $q.defer();

            $http.delete(INVITES_URI + '/' + inviteKey + '/institution_adm').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred.promise;
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

        service.deleteInvite = function deleteInvite(inviteKey) {
            var deferred = $q.defer();
            var url = `${INVITES_URI}/${inviteKey}`;
            $http.delete(url).then(function sucess(response) {
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
            var deffered = $q.defer();
            var url = `${INVITES_URI}/${invite_key}`;
            $http.patch(url, patch).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };
    });
})();