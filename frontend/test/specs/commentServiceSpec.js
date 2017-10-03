'use strict';

(describe('Test CommentService', function() {
    var http, httpBackend, deferred, scope, commentService, comments, comment, answer, error;
    var postCommentsUri = '/api/posts/post-key/comments';
    comment = {text: 'text', post_key: 'post-key', id: 'comment-id'};

    var user = {
        state: 'active'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($http, $httpBackend, $q, $rootScope, CommentService, AuthService) {
        http = $http;
        httpBackend = $httpBackend;
        deferred = $q.defer();
        scope = $rootScope.$new();
        commentService = CommentService;
        comments = [comment];
        AuthService.login(user);
        httpBackend.when('GET', 'app/main/main.html').respond(200);
        httpBackend.when('GET', 'app/home/home.html').respond(200);
        httpBackend.when('GET', 'app/error/error.html').respond(200);
    }));

    afterEach(function() {
        answer = undefined;
        error = undefined;
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('getComments()', function() {
        beforeEach(function() {
            spyOn(http, 'get').and.returnValue(deferred.promise);
            commentService.getComments(postCommentsUri).then(
                function success(response) {
                    answer = response;
                }, function err(response) {
                    error = response;
                }
            );
        });

        it('should call http.get()', function() {
            deferred.resolve(comments);
            scope.$apply();
            expect(http.get).toHaveBeenCalledWith(postCommentsUri);
            expect(answer).toEqual(comments);
            expect(error).toBeUndefined();
        });

        it('should call http.get() and occur an error', function() {
            deferred.reject({status: 400, data: {msg: 'Erro'}});
            scope.$apply();
            expect(http.get).toHaveBeenCalledWith(postCommentsUri);
            expect(answer).toBeUndefined();
            expect(error.status).toEqual(400);
        });
    });

    describe('createComment()', function() {
        var text = 'new_text';
        var institutionKey = 'institution-Key';
        var postKey = 'post-key';
        var data = {text: text, institution_key: institutionKey};
        var newComment = {text: text, post_key: postKey, id: 'new-comment-id'};

        beforeEach(function() {
            spyOn(http, 'post').and.returnValue(deferred.promise);
            commentService.createComment(postKey, text, institutionKey).then(
                function success(response) {
                    answer = response;
                }, function err(response) {
                    error = response;
                }
            );
        });

        it('should call http.post()', function() {
            deferred.resolve(newComment);
            scope.$apply();
            expect(http.post).toHaveBeenCalledWith(postCommentsUri, data);
            expect(answer).toEqual(newComment);
            expect(error).toBeUndefined();
            httpBackend.flush();
        });

        it('should call http.post() and occur an error', function() {
            deferred.reject({status: 400, data: {msg: 'Erro'}});
            scope.$apply();
            expect(http.post).toHaveBeenCalledWith(postCommentsUri, data);
            expect(answer).toBeUndefined();
            expect(error.status).toEqual(400);
            httpBackend.flush();
        });
    });

    describe('deleteComment()', function() {
        var deleteCommentUri = postCommentsUri + '/comment-id';
        beforeEach(function() {
            spyOn(http, 'delete').and.returnValue(deferred.promise);
            commentService.deleteComment('post-key', 'comment-id').then(
                function success(response) {
                    answer = response;
                }, function err(response) {
                    error = response;
                }
            );
        });

        it('should call http.delete()', function() {
            deferred.resolve(comment);
            scope.$apply();
            expect(http.delete).toHaveBeenCalledWith(deleteCommentUri);
            expect(answer).toEqual(comment);
            expect(error).toBeUndefined();
            httpBackend.flush();
        });

        it('should call http.delete() and occur an error', function() {
            deferred.reject({status: 400, data: {msg: 'Erro'}});
            scope.$apply();
            expect(http.delete).toHaveBeenCalledWith(deleteCommentUri);
            expect(answer).toBeUndefined();
            expect(error.status).toEqual(400);
            httpBackend.flush();
        });
    });

    describe('replyComment()', function() {
        var text = 'reply of comment';
        var institutionKey = 'institution-Key';
        var postKey = 'post-key';
        var data = {text: text, institution_key: institutionKey};
        var comment = {text: text, post_key: postKey, id: 'new-comment-id'};

        var replyUri = postCommentsUri+"/"+comment.id+"/replies";

        beforeEach(function() {
            spyOn(http, 'post').and.returnValue(deferred.promise);
            commentService.replyComment(postKey, text, institutionKey, comment.id).then(
                function success(response) {
                    answer = response;
                }, function err(response) {
                    error = response;
                }
            );
        });

        it('should call http.post()', function() {
            deferred.resolve(comment);
            scope.$apply();
            expect(http.post).toHaveBeenCalledWith(replyUri, data);
            expect(error).toBeUndefined();
            httpBackend.flush();
        });

        it('should call http.post() and occur an error', function() {
            deferred.reject({status: 400, data: {msg: 'Erro'}});
            scope.$apply();
            expect(http.post).toHaveBeenCalledWith(replyUri, data);
            expect(answer).toBeUndefined();
            expect(error.status).toEqual(400);
            httpBackend.flush();
        });
    });

    describe('deleteReply()', function() {
        var replyUri = postCommentsUri+"/"+comment.id+"/replies/reply-id";
        beforeEach(function() {
            spyOn(http, 'delete').and.returnValue(deferred.promise);
            commentService.deleteReply('post-key', 'comment-id', 'reply-id').then(
                function success(response) {
                    answer = response;
                }, function err(response) {
                    error = response;
                }
            );
        });

        it('should call http.delete()', function() {
            deferred.resolve(comment);
            scope.$apply();
            expect(http.delete).toHaveBeenCalledWith(replyUri);
            expect(answer).toEqual(comment);
            expect(error).toBeUndefined();
            httpBackend.flush();
        });

        it('should call http.delete() and occur an error', function() {
            deferred.reject({status: 400, data: {msg: 'Erro'}});
            scope.$apply();
            expect(http.delete).toHaveBeenCalledWith(replyUri);
            expect(answer).toBeUndefined();
            expect(error.status).toEqual(400);
            httpBackend.flush();
        });
    });

    describe('like()', function() {
        beforeEach(function() {
            spyOn(http, 'post').and.returnValue(deferred.promise);
        });

        it('should call http.post()', function() {
            var URI = postCommentsUri+'/'+comment.id+'/likes';
            commentService.like('post-key', 'comment-id').then(
                function success(response) {
                    answer = response;
                }, function err(response) {
                    error = response;
                }
            );
            deferred.resolve();
            scope.$apply();
            expect(http.post).toHaveBeenCalledWith(URI);
            expect(answer).toBeUndefined();
            httpBackend.flush();
        });

        it('should call http.post() when pass replyId as parameter', function() {
            var URI = postCommentsUri+'/'+comment.id+'/replies/reply-id/likes';
            commentService.like('post-key', 'comment-id', 'reply-id').then(
                function success(response) {
                    answer = response;
                }, function err(response) {
                    error = response;
                }
            );
            deferred.resolve();
            scope.$apply();
            expect(http.post).toHaveBeenCalledWith(URI);
            expect(answer).toBeUndefined();
            httpBackend.flush();
        });
    });

    describe('dislike()', function() {
        beforeEach(function() {
            spyOn(http, 'delete').and.returnValue(deferred.promise);
        });

        it('should call http.delete()', function(done) {
            var URI = postCommentsUri+'/'+comment.id+'/likes';
            commentService.dislike('post-key', 'comment-id').then(function() {
                expect(http.delete).toHaveBeenCalledWith(URI);
                expect(answer).toBeUndefined();
                done();
            });
            deferred.resolve();
            httpBackend.flush();
        });

        it('should call http.delete() when pass replyId as parameter', function(done) {
            var URI = postCommentsUri+'/'+comment.id+'/replies/reply-id/likes';
            commentService.dislike('post-key', 'comment-id', 'reply-id').then(function() {
                expect(http.delete).toHaveBeenCalledWith(URI);
                expect(answer).toBeUndefined();
                done();
            });
            deferred.resolve();
            httpBackend.flush();
        });
    });
}));