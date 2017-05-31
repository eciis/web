(function() {
    "use strict";
    var app = angular.module("app");

    app.service("InstitutionService", function InstitutionService($http, $q) {
        var service = this;

        service.getInstitutions = function getInstitutions() {
            var deferred = $q.defer();
            $http.get("/api/institution").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.follow = function follow(institution_key) {
            var deferred = $q.defer();
            $http.post("/api/institution/" + institution_key + "/follower").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

    });
})();