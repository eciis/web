'use strict';

(function() {
    var app = angular.module("app");

    app.service('CommentService', function CommentService($http, $q, AuthService) {
        var service = this;

        var POST_URI = '/api/posts/';
        service.user = AuthService.getCurrentUser();

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
            var body = {
                commentData: {
                    text: text, 
                    institution_key: institutionKey
                },
                currentInstitution: {
                    name: service.user.current_institution.name
                }
            };
            $http.post(POST_URI + postKey + '/comments', body).then(
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
            var body = {
                replyData: {
                    text: text, 
                    institution_key: institutionKey
                },
                currentInstitution: {
                    name: service.user.current_institution.name
                }
            };
            $http.post(POST_URI + postKey + '/comments/' + commentId + '/replies' , body).then(
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
            var deferred = $q.defer();
            var currentInstitutionName = service.user.current_institution.name;
            var URI = createLikeCommentURI(postKey, commentId, replyId);
            var body = {
                currentInstitution: {
                    name: currentInstitutionName
                }
            };            
            $http.post(URI, body).then(
                function success(response) {
                    deferred.resolve(response);
                }, function error(response) {
                    deferred.reject(response);
                }
            );
            return deferred.promise;
        };

        service.dislike = function like(postKey, commentId, replyId) {
            var deferred = $q.defer();
            var URI = createLikeCommentURI(postKey, commentId, replyId);
            $http.delete(URI).then(
                function success(response) {
                    deferred.resolve(response);
                }, function error(response) {
                    deferred.reject(response);
                }
            );
            return deferred.promise;
        };

        function createLikeCommentURI(postKey, commentId, replyId) {
            var replyUri = replyId ? `/replies/${replyId}` : "";
            var URI = POST_URI + postKey + '/comments/' + commentId + replyUri + "/likes";    
            return URI;
        }
    });
})();