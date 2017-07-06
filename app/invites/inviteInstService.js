'use strict';

(function() {
    var app = angular.module("app");

    app.service("InviteInstService", function InviteInstService($http, $q) {
        var service = this;

        var INVITES_URI = "/api/invites";

        service.sendInstInvite = function createInstInvite(invite) {
            var deferred = $q.defer();
            $http.post(INVITES_URI, invite).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();