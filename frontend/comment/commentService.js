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

        service.createComment = function createComment(postKey, text, institutionKey) {
            var deferred = $q.defer();
            var data = {'text': text, 'institution_key': institutionKey};
            $http.post(POST_URI + postKey + '/comments', data).then(
                function success(response) {
                    deferred.resolve(response);
                }, function error(response) {
                    deferred.reject(response);
                }
            );
            return deferred.promise;
        };

        service.deleteComment = function deleteComment(postKey, commentId) {
            var deferred = $q.defer();
            $http.delete(POST_URI + postKey + '/comments/' + commentId).then(
                function success(response) {
                    deferred.resolve(response);
                }, function error(response) {
                    deferred.reject(response);
                }
            );
            return deferred.promise;
        };

        service.replyComment = function createComment(postKey, text, institutionKey, commentId) {
            var deferred = $q.defer();
            var data = {'text': text, 'institution_key': institutionKey};
            $http.post(POST_URI + postKey + '/comments/' + commentId + '/replies' , data).then(
                function success(response) {
                    deferred.resolve(response);
                }, function error(response) {
                    deferred.reject(response);
                }
            );
            return deferred.promise;
        };

        service.deleteReply = function deleteReply(postKey, commentId, replyId) {
            var deferred = $q.defer();
            $http.delete(POST_URI + postKey + '/comments/' + commentId + '/replies/' + replyId).then(
                function success(response) {
                    deferred.resolve(response);
                }, function error(response) {
                    deferred.reject(response);
                }
            );
            return deferred.promise;
        };

        service.like = function like(postKey, commentId, replyId) {
            return likeOrDeslike(postKey, commentId, replyId, $http.post);
        };

        service.dislike = function like(postKey, commentId, replyId) {
            return likeOrDeslike(postKey, commentId, replyId, $http.delete);
        };

        function likeOrDeslike(postKey, commentId, replyId, method) {
            var deferred = $q.defer();
            var URI = POST_URI + postKey + '/comments/' + commentId;
            if (replyId) {
                URI = URI + "/replies/" + replyId + "/likes";
            } else {
                URI = URI + "/likes";
            }
            method(URI).then(
                function success(response) {
                    deferred.resolve(response);
                }, function error(response) {
                    deferred.reject(response);
                }
            );
            return deferred.promise;
        }
    });
})();