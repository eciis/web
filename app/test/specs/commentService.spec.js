'use strict';

describe('Test CommentService', function() {
    var http, httpBackend, deferred, scope, commentService, comments, data, error;
    var commentsUri = '/api/post/post-key/comments';
    
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
        data = undefined;
        error = undefined;
        httpBackend.when('GET', 'main/main.html').respond(200);        
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);        
    }));

    afterEach(function() {
        
    });

    it('Test getComments - Success Case', function() {
        httpBackend.expect('GET', commentsUri).respond(comments);        
        spyOn(http, 'get').and.returnValue(deferred.promise);
        deferred.resolve(comments);
        commentService.getComments(commentsUri).then(function success(response) {
            data = response;
        }, function err(response) {
            error = response;
        });
        scope.$apply();
        expect(http.get).toHaveBeenCalledWith(commentsUri);
        expect(data).toEqual(comments);
        expect(error).toBeUndefined();
    });

    it('Test getComments - Fail Case', function() {
        httpBackend.expect('GET', commentsUri).respond(comments);        
        spyOn(http, 'get').and.returnValue(deferred.promise);
        deferred.reject({status: 400, data: {msg: 'Erro'}});
        commentService.getComments(commentsUri).then(function success(response) {
            data = response;
        }, function err(response) {
            error = response;
        });
        scope.$apply();
        expect(http.get).toHaveBeenCalledWith(commentsUri);
        expect(data).toBeUndefined();
        expect(error.status).toEqual(400);
    });
});