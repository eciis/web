'use strict';

(function() {
    var app = angular.module("app");

    app.service("PostService", function PostService($http, $q, AuthService) {
        var service = this;
        var POSTS_URI = "/api/posts";
        var LIMIT = 10;
        service.posts = [];
        service.user = AuthService.getCurrentUser();

        service.get = function getPosts() {
            var deferred = $q.defer();
            $http.get("/api/user/timeline").then(function success(response) {
                service.posts = response.data;
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.getNextPosts = function getNextPosts(page) {
            var deferred = $q.defer();
            $http.get("/api/user/timeline?page=" + page + "&limit=" + LIMIT).then(function success(response) {
                service.posts = response.data;
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.createPost = function createPost(post) {
            var deferred = $q.defer();
            var institutionName = service.user.current_institution ? service.user.current_institution.name : "";
            var body = {
                post: post,
                currentInstitution: {
                    name: institutionName
                }
            };
            $http.post(POSTS_URI, body).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.likePost = function likePost(post) {
            var deferred = $q.defer();
            var body = {
                currentInstitution: {
                    name: service.user.current_institution.name 
                }
            };
            $http.post(`${POSTS_URI}/${post.key}/likes`, body)
            .then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.dislikePost = function dislikePost(post) {
            var deferred = $q.defer();
            $http.delete(POSTS_URI + '/' + post.key + '/likes').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deletePost = function deletePost(post) {
            var deferred = $q.defer();
            $http.delete(POSTS_URI + '/' + post.key).then(function success(response) {
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

        service.save = function save(post_key, patch) {
            var deffered = $q.defer();
            $http.patch(POSTS_URI + '/' + post_key, patch).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.getPost = function getPost(postKey) {
            var deffered = $q.defer();
            $http.get(POSTS_URI + '/' + postKey).then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.addSubscriber = function addSubscriber(postKey) {
            var deffered = $q.defer();
            $http.post(POSTS_URI + '/' + postKey + '/subscribers').then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };

        service.removeSubscriber = function removeSubscriber(postKey) {
            var deffered = $q.defer();
            $http.delete(POSTS_URI + '/' + postKey + '/subscribers').then(function success(info) {
                deffered.resolve(info.data);
            }, function error(data) {
                deffered.reject(data);
            });
            return deffered.promise;
        };
    });
})();