'use strict';

(function() {
    var app = angular.module("app");

    app.service('CommentService', function CommentService(HttpService, $q, AuthService) {
        var service = this;

        var POST_URI = '/api/posts/';
        service.user = AuthService.getCurrentUser();

        service.getComments = function getComments(commentUri) {
            return HttpService.get(commentUri);
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
            return HttpService.post(POST_URI + postKey + '/comments', body);
        };

        service.deleteComment = function deleteComment(postKey, commentId) {
            return HttpService.delete(POST_URI + postKey + '/comments/' + commentId);
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
            return HttpService.post(POST_URI + postKey + '/comments/' + commentId + '/replies' , body);
        };

        service.deleteReply = function deleteReply(postKey, commentId, replyId) {
            return HttpService.delete(POST_URI + postKey + '/comments/' + commentId + '/replies/' + replyId);
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
            return HttpService.post(URI, body);
        };

        service.dislike = function like(postKey, commentId, replyId) {
            var URI = createLikeCommentURI(postKey, commentId, replyId);
            return HttpService.delete(URI);
        };

        function createLikeCommentURI(postKey, commentId, replyId) {
            var replyUri = replyId ? `/replies/${replyId}` : "";
            var URI = POST_URI + postKey + '/comments/' + commentId + replyUri + "/likes";    
            return URI;
        }
    });
})();