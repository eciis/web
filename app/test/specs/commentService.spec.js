'use strict';

describe('Test CommentService', function() {
    var http, httpBackend, deferred, scope, commentService, comments, resp, error;
    var postCommentsUri = '/api/posts/post-key/comments';
    
    beforeEach(module('app'));

    beforeEach(inject(function($http, $httpBackend, $q, $rootScope, CommentService) {
        http = $http;
        httpBackend = $httpBackend;
        deferred = $q.defer();
        scope = $rootScope.$new();
        commentService = CommentService;
        comments = [{
            text: 'text',
            post_key: 'post_key',
            id: 'comment_id'
        }];
        httpBackend.when('GET', 'main/main.html').respond(200);        
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);        
    }));

    afterEach(function() {
        resp = undefined;
        error = undefined;
    });

    describe('Test getComments', function() { 
        beforeEach(function() {
            httpBackend.expectGET(postCommentsUri).respond(comments);        
            spyOn(http, 'get').and.returnValue(deferred.promise);
        });

        it('Success case', function() {
            deferred.resolve(comments);
            commentService.getComments(postCommentsUri).then(function success(response) {
                resp = response;
            }, function err(response) {
                error = response;
            });
            scope.$apply();
            expect(http.get).toHaveBeenCalledWith(postCommentsUri);
            expect(resp).toEqual(comments);
            expect(error).toBeUndefined();
        });

        it('Fail case', function() {
            deferred.reject({status: 400, data: {msg: 'Erro'}});
            commentService.getComments(postCommentsUri).then(function success(response) {
                resp = response;
            }, function err(response) {
                error = response;
            });
            scope.$apply();
            expect(http.get).toHaveBeenCalledWith(postCommentsUri);
            expect(resp).toBeUndefined();
            expect(error.status).toEqual(400);
        });
    });

    describe('Test creatComment', function() {
        var text = 'new_text';
        var institutionKey = 'institutionKey';
        var postKey = 'post-key';
        var data = {text: text, institution_key: institutionKey};
        var newComment = {text: text, post_key: postKey, id: 'new_comment_id'};

        beforeEach(function() {
            httpBackend.expectPOST(postCommentsUri, data).respond(newComment);
            spyOn(http, 'post').and.returnValue(deferred.promise);
        });

        it('Sucess case', function() {
            deferred.resolve(newComment);
            commentService.createComment(postKey, text, institutionKey)
            .then(function success(response) {
                resp = response;
            }, function err(response) {
                error = response;
            });
            scope.$apply();
            expect(http.post).toHaveBeenCalledWith(postCommentsUri, data);
            expect(resp).toEqual(newComment);
            expect(error).toBeUndefined();
        });

        it('Fail case', function() {
            deferred.reject({status: 400, data: {msg: 'Erro'}});
            commentService.createComment(postKey, text, institutionKey)
            .then(function success(response) {
                resp = response;
            }, function err(response) {
                error = response;
            });
            scope.$apply();
            expect(http.post).toHaveBeenCalledWith(postCommentsUri, data);
            expect(resp).toBeUndefined();
            expect(error.status).toEqual(400);
        });
    });
});