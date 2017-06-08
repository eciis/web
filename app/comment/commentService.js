'use strict';

(function() {
    var app = angular.module("app");

    app.service('CommentService', function CommentService($http, $q) {
        var service = this;
        
        var POST_URI = '/api/post/';

        service.getComments = function getComments(post_key) {
            var deferred = $q.defer();
            $http.get(POST_URI + post_key + '/comment').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.createComment = function createComment(post_key) {
            var deferred = $q.defer();
            $http.post(POST_URI + post_key + '/comment').then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deleteComment = function deleteComment(post_key, comment_id) {
            var deferred = $q.defer();
            $http.delete(POST_URI + post_key + '/comment/' + comment_id).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();