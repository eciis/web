(function() {
    "use strict";
    var app = angular.module("app");

    app.service("InstitutionService", function InstitutionService($http, $q) {
        var service = this;

        var INSTITUTION_URI = "/api/institution";

        service.getInstitutions = function getInstitutions() {
            var deferred = $q.defer();
            $http.get(INSTITUTION_URI).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.follow = function follow(institution_key) {
            var deferred = $q.defer();
            $http.post(INSTITUTION_URI + "/" + institution_key + "/follow").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.unfollow = function unfollow(institution_key) {
            var deferred = $q.defer();
            $http.post(INSTITUTION_URI + "/" + institution_key + "/unfollow").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getTimeline = function getInstitutions(institution_key) {
            var deferred = $q.defer();
            $http.get(INSTITUTION_URI + "/" + institution_key + "/timeline").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getMembers = function getMembers(institution_key) {
            var deferred = $q.defer();
            $http.get(INSTITUTION_URI + "/" + institution_key + "/members").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getFollowers = function getFollowers(institution_key) {
            var deferred = $q.defer();
            $http.get(INSTITUTION_URI + "/" + institution_key + "/followers").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getInstitution = function getInstitution(institution_key) {
            var deferred = $q.defer();
            $http.get(INSTITUTION_URI + "/" + institution_key).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();