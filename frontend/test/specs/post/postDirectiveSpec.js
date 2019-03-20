'use strict';

(describe('Test PostDirective', function() {
    beforeEach(module('app'));

    let postCtrl, post, httpBackend, scope, deffered, mdDialog, rootScope, postService, mdToast, http, imageService;

    let user = {
        name: 'name',
        current_institution: {key: "institutuion_key"},
        state: 'active',
        permissions: {}
    };

    let options = [{'id' : 0,
                    'text': 'Option number 1',
                    'number_votes': 0,
                    'voters': [] },
                    {'id': 1,
                    'text': 'Option number 2',
                    'number_votes': 0,
                    'voters': [] }];

    let survey = { 'title' : 'The Survey',
                    'type_survey' : 'multiple_choice',
                    'options' : options
                    };

    const saveForm = {
        $invalid: false,
        $setPristine: function() {},
        $setUntouched: function() {}
    }

    beforeEach(inject(function($controller, $httpBackend, HttpService, $q, $mdDialog,
            PostService, AuthService, $mdToast, $rootScope, ImageService) {
        imageService = ImageService;
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        deffered = $q.defer();
        mdDialog = $mdDialog;
        postService = PostService;
        mdToast = $mdToast;
        http = HttpService;
        AuthService.login(user);

        postCtrl = $controller('PostController', {
            scope: scope,
            imageService : imageService,
            $rootScope: rootScope,
            $scope: scope
        });

        postCtrl.user = new User(user);
        postCtrl.posts = [];

        post = {
            title: 'title',
            text: 'text',
            institution: {},
            photo_url: null,
            pdf_files: [],
            key: 'kapsod-OPASKDOPA'
        };

        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
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

    describe('Choice survey', function() {
        it('should be survey post', function() {
            expect(postCtrl.typePost).toEqual("Common");
            postCtrl.choiceSurvey();
            expect(postCtrl.typePost).toEqual("Survey");
        });
    });

    describe('isValid()', function() {
        it('should not be valid', function() {
            post.title = undefined;
            postCtrl.post = new Post(post, {});
            var formInvalid = true;
            expect(postCtrl.isValid(postCtrl.post, formInvalid)).toBeFalsy();
        });

        it('should be valid', function() {
            postCtrl.post = new Post(post, {});
            var formInvalid = false;
            expect(postCtrl.isValid(postCtrl.post, formInvalid)).toBeTruthy();
        });
    });

    describe('clearPost()', function() {
        it('should change the current post instance to an empty object', function() {
            postCtrl.post = new Post(post, {});
            postCtrl.clearPost();
            expect(postCtrl.post).toEqual({});
        });
    });

    describe('clearForm()', () => {
        it('should call saveForm.$setPristine', () => {
            spyOn(saveForm, '$setPristine');
            postCtrl.clearForm(saveForm);
            expect(saveForm.$setPristine).toHaveBeenCalled();
        });

        it('should call saveForm.$setUntouched', () => {
            spyOn(saveForm, '$setUntouched');
            postCtrl.clearForm(saveForm);
            expect(saveForm.$setUntouched).toHaveBeenCalled();
        });
    });

    describe('cancelDialog()', function() {
        it('should call mdDialog.cancel()', function() {
            spyOn(mdDialog, 'cancel');
            postCtrl.cancelDialog();
            expect(mdDialog.cancel).toHaveBeenCalled();
        });
    });

    describe('createPost()', function() {
        beforeEach(function() {
            spyOn(postService, 'createPost').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({key: post.key });
                    }
                };
            });
        });

        it('should create a post', function() {
            spyOn(postCtrl.user, 'addPermissions');
            postCtrl.post = post;
            var newPost = new Post(postCtrl.post, postCtrl.user.current_institution.key);
            spyOn(postCtrl, 'clearPost');
            spyOn(mdDialog, 'hide');
            deffered.resolve(newPost);
            postCtrl.createPost(saveForm);
            scope.$apply();
            expect(postService.createPost).toHaveBeenCalledWith(newPost);
            expect(postCtrl.clearPost).toHaveBeenCalled();
            expect(mdDialog.hide).toHaveBeenCalled();
            expect(postCtrl.user.addPermissions).toHaveBeenCalledWith(['edit_post', 'remove_post'], postCtrl.post.key);
        });

        it('should not create a post when it is invalid', function() {
            postCtrl.post = {};
            postCtrl.createPost(saveForm);
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

            spyOn(postService, 'createPost').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({ data: { key: 'akpsodka-OKSDOPAK' } });
                    }
                };
            });
        });

        it(' Should add new image in post', function() {
            spyOn(postCtrl, 'clearPost');
            spyOn(mdDialog, 'hide');

            postCtrl.post = post;
            var newPost = new Post(postCtrl.post, postCtrl.user.current_institution.key);
            deffered.resolve(newPost);

            var image = createImage(100);
            postCtrl.addImage(image);
            postCtrl.createPost(saveForm);
            scope.$apply();

            expect(postService.createPost).toHaveBeenCalled();
            expect(imageService.compress).toHaveBeenCalled();
            expect(imageService.readFile).toHaveBeenCalled();
            expect(postCtrl.clearPost).toHaveBeenCalled();
            expect(mdDialog.hide).toHaveBeenCalled();
        });
    });
}));