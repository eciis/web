'use strict';

(function() {
    var app = angular.module("app");

    app.service("PostService", function PostService($http, $q) {
        var service = this;

        var POST_URI = "/api/post";

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
            $http.post(POST_URI, post).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.likePost = function likePost(post) {
            var deferred = $q.defer();
            $http.post(POST_URI + '/' + post.key + '/likes').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.dislikePost = function dislikePost(post) {
            var deferred = $q.defer();
            $http.delete(POST_URI + '/' + post.key + '/likes').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deletePost = function deletePost(post) {
            var deferred = $q.defer();
            $http.delete(POST_URI + '/' + post.key).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getLikes = function getLikes(likesURL) {
            var deferred = $q.defer();
            $http.get(likesURL).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();