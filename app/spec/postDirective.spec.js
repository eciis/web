'use strict';

describe('Test PostDirective', function() {
    beforeEach(module('app'));

    var postCtrl, post, user, httpBackend, scope, deffered, mdDialog, rootScope, postService, mdToast;

    beforeEach(inject(function($controller, $httpBackend, $q, $mdDialog, 
            PostService, AuthService, $mdToast, $rootScope) {
        postCtrl = $controller('PostController');
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        scope = $rootScope.$new();
        deffered = $q.defer();
        mdDialog = $mdDialog;
        postService = PostService;
        mdToast = $mdToast;
        user = {
            name: 'name',
            current_institution: {key: "abc"}
        };
        post = {
            title: 'title',
            text: 'text',
            institution: {}
        };
        postCtrl.user = user;
        httpBackend.when('GET', '/api/user').respond(user);
        httpBackend.when('POST', '/api/posts').respond(post);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.flush();   
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('post should not to have properties', function() {
        expect(postCtrl.post).toEqual({});
    });

    it('post should be invalid', function() {
        post.title = undefined;
        postCtrl.post = new Post(post, {});
        spyOn(postCtrl, 'isPostValid').and.returnValue(false);
        expect(postCtrl.isPostValid()).toBeFalsy();
    });

    it('post should be valid', function() {
        postCtrl.post = new Post(post, {});
        spyOn(postCtrl, 'isPostValid').and.returnValue(true);
        expect(postCtrl.isPostValid()).toBeTruthy();
    });

    it('should change the current post instance to an empty object', function() {
        postCtrl.post = new Post(post, {});
        spyOn(postCtrl, 'clearPost').and.callThrough();
        postCtrl.clearPost();
        expect(postCtrl.post).toEqual({});
    });

    it('should cancel dialog', function() {
        spyOn(mdDialog, 'hide');
        postCtrl.cancelDialog();
        expect(mdDialog.hide).toHaveBeenCalled();
    });

    it('should create a post (successfull case)', function() {
        postCtrl.post = post;
        var newPost = new Post(postCtrl.post, postCtrl.user.current_institution.key);
        spyOn(postService, 'createPost').and.returnValue(deffered.promise);
        spyOn(postCtrl, 'clearPost').and.callThrough();
        spyOn(mdDialog, 'hide');
        deffered.resolve(post);
        postCtrl.createPost();  
        rootScope.$apply();
        expect(postService.createPost).toHaveBeenCalledWith(newPost);
        expect(postCtrl.clearPost).toHaveBeenCalled();
        expect(mdDialog.hide).toHaveBeenCalled();
    });

    it('should not create a post (Fail case)', function() {
        postCtrl.post = post;
        spyOn(postService, 'createPost').and.returnValue(deffered.promise);
        spyOn(mdDialog, 'hide');
        deffered.reject({status: 400, data: {msg: 'Erro'}});
        postCtrl.createPost();  
        rootScope.$apply();
        expect(postService.createPost).toHaveBeenCalled();
        expect(mdDialog.hide).toHaveBeenCalled();
    });

    it('should not create a post (post invalid)', function() {
        postCtrl.post = {};
        spyOn(postService, 'createPost');
        postCtrl.createPost();  
        expect(postService.createPost).not.toHaveBeenCalled();
    });
});