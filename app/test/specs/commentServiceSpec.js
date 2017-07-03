'use strict';

describe('Test CommentService', function() {
    var http, httpBackend, deferred, scope, commentService, comments, comment, answer, error;
    var postCommentsUri = '/api/posts/post-key/comments';
    comment = {text: 'text', post_key: 'post-key', id: 'comment-id'};

    beforeEach(module('app'));

    beforeEach(inject(function($http, $httpBackend, $q, $rootScope, CommentService) {
        http = $http;
        httpBackend = $httpBackend;
        deferred = $q.defer();
        scope = $rootScope.$new();
        commentService = CommentService;
        comments = [comment];
        httpBackend.when('GET', 'main/main.html').respond(200);        
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200); 
    }));

    afterEach(function() {
        answer = undefined;
        error = undefined;
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('Test getComments', function() { 
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

        it('Success case', function() {
            deferred.resolve(comments);
            scope.$apply();
            expect(http.get).toHaveBeenCalledWith(postCommentsUri);
            expect(answer).toEqual(comments);
            expect(error).toBeUndefined();
        });

        it('Failure case', function() {
            deferred.reject({status: 400, data: {msg: 'Erro'}});
            scope.$apply();
            expect(http.get).toHaveBeenCalledWith(postCommentsUri);
            expect(answer).toBeUndefined();
            expect(error.status).toEqual(400);
        });
    });

    describe('Test createComment', function() {
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

        afterEach(function() {
            httpBackend.flush();
        });

        it('Sucess case', function() {
            deferred.resolve(newComment);
            scope.$apply();
            expect(http.post).toHaveBeenCalledWith(postCommentsUri, data);
            expect(answer).toEqual(newComment);
            expect(error).toBeUndefined();
        });

        it('Failure case', function() {
            deferred.reject({status: 400, data: {msg: 'Erro'}});
            scope.$apply();
            expect(http.post).toHaveBeenCalledWith(postCommentsUri, data);
            expect(answer).toBeUndefined();
            expect(error.status).toEqual(400);
        });
    });

    describe('Test deleteComment', function() {
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

        afterEach(function() {
            httpBackend.flush();
        });

        it('Success case', function() {
            deferred.resolve(comment);
            scope.$apply();
            expect(http.delete).toHaveBeenCalledWith(deleteCommentUri);
            expect(answer).toEqual(comment);
            expect(error).toBeUndefined();
        });

        it('Failure case', function() {
            deferred.reject({status: 400, data: {msg: 'Erro'}});
            scope.$apply();
            expect(http.delete).toHaveBeenCalledWith(deleteCommentUri);
            expect(answer).toBeUndefined();
            expect(error.status).toEqual(400);
        });
    });
});