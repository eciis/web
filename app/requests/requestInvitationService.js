"use strict";

(function() {
    var app = angular.module("app");

    app.service("RequestInvitationService", function RequestInvitationService($http, $q) {
        var service = this;
        var REQUESTS_URI = "/api/institutions/";

        service.sendRequest = function sendRequest(request, institution_key) {
            var deferred = $q.defer();

            $http.post(REQUESTS_URI + institution_key + "/requests/user", request).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });

            return deferred.promise;
        };
    });
})();