'use strict';

(function() {
    var app = angular.module("app");

    app.service("PostService", function PostService($http, $q) {
        var service = this;

        service.get = function getPosts() {
            var deferred = $q.defer();
            $http.get("/api/user/timeline").then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.createPost = function createPost(post) {
            var deferred = $q.defer();
            $http.post("/api/post", post).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.likePost = function likePost(post) {
            var deferred = $q.defer();
            $http.post('/api/post/' + post.key + '/like').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deslikePost = function deslikePost(post) {
            var deferred = $q.defer();
            $http.post('/api/post/' + post.key + '/deslike').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deletePost = function deletePost(post) {
            var deferred = $q.defer();
            $http.delete("/api/post/" + post.key).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();