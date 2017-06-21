'use strict';

(function() {
    var app = angular.module("app");

    app.service('CommentService', function CommentService($http, $q) {
        var service = this;

        var POST_URI = '/api/posts/';

        service.getComments = function getComments(commentUri) {
            var deferred = $q.defer();
            $http.get(commentUri).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.createComment = function createComment(postKey, text) {
            var deferred = $q.defer();
            var data = {'text': text};
            $http.post(POST_URI + postKey + '/comments', data).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };

        service.deleteComment = function deleteComment(postKey, commentId) {
            var deferred = $q.defer();
            $http.delete(POST_URI + postKey + '/comments/' + commentId).then(function success(response) {
                deferred.resolve(response);
            }, function error(response) {
                deferred.reject(response);
            });
            return deferred.promise;
        };
    });
})();