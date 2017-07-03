'use strict';

describe('Test PostDirective', function() {
    beforeEach(module('app'));

    var postCtrl, post, httpBackend, scope, deffered, mdDialog, rootScope, postService, mdToast, http;
    var user = {
        name: 'name',
        current_institution: {key: "institutuion_key"}
    };
   
    beforeEach(inject(function($controller, $httpBackend, $http, $q, $mdDialog, 
            PostService, AuthService, $mdToast, $rootScope) {
        scope = $rootScope.$new();
        postCtrl = $controller('PostController', {scope: scope});
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        deffered = $q.defer();
        mdDialog = $mdDialog;
        postService = PostService;
        mdToast = $mdToast;
        http = $http;
        postCtrl.user = user;
        post = {
            title: 'title',
            text: 'text',
            institution: {}
        };
        httpBackend.expectGET('/api/user').respond(user);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.flush();   
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('Test isPostValid', function() {
        it('post should not to have properties', function() {
            expect(postCtrl.post).toEqual({});
        });

        it('post should not be valid', function() {
            post.title = undefined;
            postCtrl.post = new Post(post, {});
            expect(postCtrl.isPostValid()).toBeFalsy();
        });

        it('post should be valid', function() {
            postCtrl.post = new Post(post, {});
            expect(postCtrl.isPostValid()).toBeTruthy();
        });
    });    

    describe('Test clearPost', function() {
        it('should change the current post instance to an empty object', function() {
            postCtrl.post = new Post(post, {});
            postCtrl.clearPost();
            expect(postCtrl.post).toEqual({});
        });
    });
    
    describe('Test cancelDialog', function() {
        it('should cancel dialog', function() {
            spyOn(mdDialog, 'hide');
            postCtrl.cancelDialog();
            expect(mdDialog.hide).toHaveBeenCalled();
        });
    });
    
    describe('Test createPost', function() {
        it('should create a post (successfull case)', function() {
            spyOn(postService, 'createPost').and.returnValue(deffered.promise);
            spyOn(postCtrl, 'clearPost');
            spyOn(mdDialog, 'hide');
            postCtrl.post = post;
            var newPost = new Post(postCtrl.post, postCtrl.user.current_institution.key);
            deffered.resolve(newPost);
            postCtrl.createPost();  
            scope.$apply();
            expect(postService.createPost).toHaveBeenCalledWith(newPost);
            expect(postCtrl.clearPost).toHaveBeenCalled();
            expect(mdDialog.hide).toHaveBeenCalled();
        });

        it('should occur an error when creating a post (Fail case)', function() {
            spyOn(postService, 'createPost').and.returnValue(deffered.promise);
            spyOn(mdDialog, 'hide');
            postCtrl.post = post;
            deffered.reject({status: 400, data: {msg: 'Erro'}});
            postCtrl.createPost();
            rootScope.$apply();
            expect(postService.createPost).toHaveBeenCalled();
            expect(mdDialog.hide).toHaveBeenCalled();
        });

        it('should not create a post (post invalid)', function() {
            spyOn(postService, 'createPost');
            postCtrl.post = {};
            postCtrl.createPost();  
            expect(postService.createPost).not.toHaveBeenCalled();
        });
    });   
});