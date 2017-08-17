'use strict';

(describe('Test PostDirective', function() {
    beforeEach(module('app'));

    var postCtrl, post, httpBackend, scope, deffered, mdDialog, rootScope, postService, mdToast, http, imageService;
    var user = {
        name: 'name',
        current_institution: {key: "institutuion_key"}
    };

    beforeEach(inject(function($controller, $httpBackend, $http, $q, $mdDialog,
            PostService, AuthService, $mdToast, $rootScope, ImageService) {
        imageService = ImageService;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        deffered = $q.defer();
        mdDialog = $mdDialog;
        postService = PostService;
        mdToast = $mdToast;
        http = $http;

        postCtrl = $controller('PostController', {
            scope: scope, 
            imageService : imageService, 
            $rootScope: rootScope,
        });

        postCtrl.user = user;
        postCtrl.posts = [];

        post = {
            title: 'title',
            text: 'text',
            institution: {}
        };

        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('Initial post', function() {
        it('should not have properties', function() {
            expect(postCtrl.post).toEqual({});
        });
    });

    describe('isPostValid()', function() {
        it('should not be valid', function() {
            post.title = undefined;
            postCtrl.post = new Post(post, {});
            expect(postCtrl.isPostValid()).toBeFalsy();
        });

        it('should be valid', function() {
            postCtrl.post = new Post(post, {});
            expect(postCtrl.isPostValid()).toBeTruthy();
        });
    });

    describe('clearPost()', function() {
        it('should change the current post instance to an empty object', function() {
            postCtrl.post = new Post(post, {});
            postCtrl.clearPost();
            expect(postCtrl.post).toEqual({});
        });
    });

    describe('cancelDialog()', function() {
        it('should call mdDialog.hide()', function() {
            spyOn(mdDialog, 'hide');
            postCtrl.cancelDialog();
            expect(mdDialog.hide).toHaveBeenCalled();
        });
    });

    describe('createPost()', function() {
        it('should create a post', function() {
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

        it('should occur an error when creating a post', function() {
            spyOn(postService, 'createPost').and.returnValue(deffered.promise);
            spyOn(mdDialog, 'hide');
            postCtrl.post = post;
            deffered.reject({status: 400, data: {msg: 'Erro'}});
            postCtrl.createPost();
            rootScope.$apply();
            expect(postService.createPost).toHaveBeenCalled();
            expect(mdDialog.hide).toHaveBeenCalled();
        });

        it('should not create a post when it is invalid', function() {
            spyOn(postService, 'createPost');
            postCtrl.post = {};
            postCtrl.createPost();
            expect(postService.createPost).not.toHaveBeenCalled();
        });
    });

    describe('addImage()', function() {
        beforeEach(function() {
            var image = createImage(100);
            spyOn(imageService, 'compress').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback(image);
                    }
                };
            });

            spyOn(imageService, 'readFile').and.callFake(function() {
                postCtrl.post.photo_url = "Base64 data of photo";
            });

            spyOn(imageService, 'saveImage').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback({
                            url : "imagens/test"
                        });
                    }
                };
            });
        });

        it(' Should add new image in post', function() {
            spyOn(postService, 'createPost').and.returnValue(deffered.promise);
            spyOn(postCtrl, 'clearPost');
            spyOn(mdDialog, 'hide');

            postCtrl.post = post;
            var newPost = new Post(postCtrl.post, postCtrl.user.current_institution.key);
            deffered.resolve(newPost);

            var image = createImage(100);
            postCtrl.addImage(image);
            postCtrl.createPost();
            scope.$apply();

            expect(imageService.compress).toHaveBeenCalled();
            expect(imageService.readFile).toHaveBeenCalled();
            expect(postCtrl.clearPost).toHaveBeenCalled();
            expect(mdDialog.hide).toHaveBeenCalled();
        });
    });
}));