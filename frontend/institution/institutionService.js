(function() {
    "use strict";
    var app = angular.module("app");

    app.service("InstitutionService", function InstitutionService($http, $q, AuthService) {
        var service = this;

        var INSTITUTIONS_URI = "/api/institutions";
        var LIMIT = 10;
        service.user = AuthService.getCurrentUser();

        service.getInstitutions = function getInstitutions() {
            var deferred = $q.defer();
            $http.get(INSTITUTIONS_URI).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getNextInstitutions = function getNextInstitutions(page) {
            var deferred = $q.defer();
            $http.get("/api/institutions?page=" + page + "&limit=" + LIMIT).then(function success(response) {  
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.searchInstitutions = function searchInstitutions(value, state, type) {
            var deferred = $q.defer();
            $http({url: "/api/search/institution",
                method: "GET",
                params: {value: value, state: state, type: type}
            }).then(function success(response) {
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
            $http.get(INSTITUTIONS_URI + "/" + institution_key + "/timeline?page=" + page + "&limit=" + LIMIT).then(function success(response) {
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

        service.removeMember = function removeMember(institutionKey, member, justification) {
            var deffered = $q.defer();
            $http.delete(INSTITUTIONS_URI + "/" + institutionKey + "/members?removeMember=" + member.key + "&justification=" + justification)
            .then(function success(info) {
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

        service.save = function save(data, institutionKey, inviteKey) {
            var body = {data: data};
            var deffered = $q.defer();
            $http.put(INSTITUTIONS_URI + "/" + institutionKey + "/invites/" + inviteKey, body).then(function success(info) {
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

        service.removeInstitution = function removeInstitution(institutionKey, removeHierarchy, justification) {
            var deffered = $q.defer();
            $http.delete(
                INSTITUTIONS_URI + "/" + institutionKey,
                {params: {removeHierarchy: removeHierarchy, justification: justification}}
            ).then(
                function success(info) {
                    deffered.resolve(info.data);
                }, function error(data) {
                    deffered.reject(data);
                }
            );
            return deffered.promise;
        };

        service.getLegalNatures = function getLegalNatures() {
            var deferred = $q.defer();
            $http.get('app/institution/legal_nature.json').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getActuationAreas = function getActuationAreas() {
            var deferred = $q.defer();
            $http.get('app/institution/actuation_area.json').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
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