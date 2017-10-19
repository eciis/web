(function() {
    "use strict";
    var app = angular.module("app");

    app.service("InstitutionService", function InstitutionService($http, $q) {
        var service = this;

        var INSTITUTIONS_URI = "/api/institutions";
        var fetchs = 10;

        service.getInstitutions = function getInstitutions() {
            var deferred = $q.defer();
            $http.get(INSTITUTIONS_URI).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.searchInstitutions = function searchInstitutions(value, state) {
            var deferred = $q.defer();
            $http.get("/api/search/institution?value=" + '"' + value + '"' + "&state=" + state).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.follow = function follow(institution_key) {
            var deferred = $q.defer();
            $http.post(INSTITUTIONS_URI + "/" + institution_key + "/followers").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.unfollow = function unfollow(institution_key) {
            var deferred = $q.defer();
            $http.delete(INSTITUTIONS_URI + "/" + institution_key + "/followers").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getNextPosts = function getNextPosts(institution_key, page) {
            var deferred = $q.defer();
            $http.get(INSTITUTIONS_URI + "/" + institution_key + "/timeline?page=" + page + "&&fetchs=" + fetchs).then(function success(response) {
                service.posts = response.data;
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getMembers = function getMembers(institution_key) {
            var deferred = $q.defer();
            $http.get(INSTITUTIONS_URI + "/" + institution_key + "/members").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.removeMember = function removeMember(institutionKey, member) {
            var deffered = $q.defer();
            $http.delete(INSTITUTIONS_URI + "/" + institutionKey + "/members?removeMember=" + member.key).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.getFollowers = function getFollowers(institution_key) {
            var deferred = $q.defer();
            $http.get(INSTITUTIONS_URI + "/" + institution_key + "/followers").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getInstitution = function getInstitution(institution_key) {
            var deferred = $q.defer();
            $http.get(INSTITUTIONS_URI + "/" + institution_key).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.save = function save(data_profile, institutionKey, inviteKey) {
            var deffered = $q.defer();
            $http.post(INSTITUTIONS_URI + "/" + institutionKey + "/invites/" + inviteKey, data_profile).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.update = function update(institutionKey, patch) {
            var deffered = $q.defer();
            $http.patch(INSTITUTIONS_URI + "/" + institutionKey, patch).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.removeInstitution = function removeInstitution(institutionKey, removeHierarchy) {
            var deffered = $q.defer();
            $http.delete(INSTITUTIONS_URI + "/" + institutionKey + "?removeHierarchy=" + removeHierarchy).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.removeLink = function removeLink(institutionKey, institutionLink, isParent) {
            var deffered = $q.defer();
            $http.delete(INSTITUTIONS_URI + "/" + institutionKey + "/hierarchy/" + institutionLink + "?isParent=" + isParent).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };
    });
})();