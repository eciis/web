'use strict';

(describe('Test SharePostController', function() {

    var shareCtrl, scope, httpBackend, rootScope, mdDialog, postService, deffered, state;

    var institutions = [
        {name: 'Splab', key: '098745'},
        {name: 'e-CIS', key: '456879'}
    ];

    var event = new Event({'title': 'Event',
                           'local': 'Brazil',
                           'start_time': new Date(),
                           'end_time': new Date()
                          }, institutions[1].institution_key);

    var user = new User({
        name: 'user',
        institutions: institutions,
        follows: institutions,
        institutions_admin: institutions[0],
        current_institution: institutions[0],
        state: 'active'
    });

    user.current_institution = institutions[0];

    // Post of e-CIS by user
    var post = new Post({'title': 'Shared Post',
                         'text': 'This post will be shared',
                         'photo_url': null,
                         'key': '12300'
                        },
                        institutions[1].institution_key);

    // Post of Splab by user
    var newPost = new Post( {key: 'kaopdkso-SODPKAOP'}, user.current_institution.key);

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $http, $mdDialog, $q,
            PostService, AuthService, $rootScope, $state) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        mdDialog = $mdDialog;
        state = $state;
        deffered = $q.defer();
        postService = PostService;
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        AuthService.login(user);

        shareCtrl = $controller('SharePostController', {
            scope: scope,
            user: user,
            post: post,
            posts:[post],
            addPost: true
        });
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('cancelDialog()', function() {

        it('Should call mdDialog.cancel', function() {
            spyOn(mdDialog, 'cancel');
            shareCtrl.cancelDialog();
            expect(mdDialog.cancel).toHaveBeenCalled();
        });
    });

    describe('showImage()', function() {

        it('Should be false', function() {
            expect(shareCtrl.showImage()).toBe(false);
        });

        it('Should be true', function() {
            shareCtrl.post.photo_url = "link_imagem";
            expect(shareCtrl.showImage()).toBe(true);
        });
    });

    describe('goTo()', function() {

        it('Should call state.go to post', function() {
            spyOn(state, 'go').and.callThrough();
            shareCtrl.goTo();
            expect(state.go).toHaveBeenCalledWith('app.post', Object({postKey: shareCtrl.post.key}));
        });

        it('Should call state.go to event', function() {
            shareCtrl.post = event;
            spyOn(state, 'go').and.callThrough();
            shareCtrl.goTo();
            expect(state.go).toHaveBeenCalledWith('app.user.event', Object({eventKey: shareCtrl.post.key}));
        });
    });

    describe('isEvent()', function() {

        it('Should be true', function() {
            shareCtrl.post = event;            
            expect(shareCtrl.isEvent()).toBe(true);
        });

        it('Should be false', function() {
            expect(shareCtrl.isEvent()).toBe(false);
        });
    });

    describe('share()', function() {

        it('Should call postService.createPost, in case that share event', function() {
            spyOn(shareCtrl.user, 'addPermissions');
            spyOn(postService, 'createPost').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({data: newPost});
                    }
                };
            });
            shareCtrl.post = event;
            var response = new Post( {}, user.current_institution.key);
            response.shared_event = event.key;
            response.pdf_files = [];
            
            spyOn(mdDialog, 'hide');

            shareCtrl.share();
            scope.$apply();

            expect(postService.createPost).toHaveBeenCalledWith(response);
            expect(mdDialog.hide).toHaveBeenCalled();
            expect(shareCtrl.user.addPermissions).toHaveBeenCalledWith(['edit_post', 'remove_post'], newPost.key)
        });

        it('Should call postService.createPost, in case that share post', function() {
            spyOn(shareCtrl.user, 'addPermissions');
            spyOn(postService, 'createPost').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({data: newPost});
                    }
                };
            });
            shareCtrl.post = post;
            var response_post = new Post( {}, user.current_institution.key);
            response_post.shared_post = post.key;
            response_post.pdf_files = [];

            spyOn(mdDialog, 'hide');

            shareCtrl.share();
            scope.$apply();

            expect(postService.createPost).toHaveBeenCalledWith(response_post);
            expect(mdDialog.hide).toHaveBeenCalled();
            expect(shareCtrl.user.addPermissions).toHaveBeenCalledWith(['edit_post', 'remove_post'], newPost.key)
        });
    });

    describe('showImage()', function() {
        var post;

        beforeEach(function() {
            post = new Post();
            post.photo_url = "www.photo-url.com";
            post.state = "published";
            shareCtrl.post = post;
        });

        it('should return True when the post has a photo_url', function() {
            expect(shareCtrl.showImage()).toBe(true);
        });

        it('should return false when the post is deleted', function() {
            shareCtrl.post.state = "deleted";
            expect(shareCtrl.showImage()).toBe(false);
        });

        it('should return false when the post does not have a photo_url', function() {
            shareCtrl.post.photo_url = null;
            expect(shareCtrl.showImage()).toBe(false);
            shareCtrl.post.photo_url = "";
            expect(shareCtrl.showImage()).toBe(false);
            shareCtrl.post.photo_url = undefined;
            expect(shareCtrl.showImage()).toBe(false);
        });
    });

    describe('showVideo()', function() {
        var post;

        beforeEach(function() {
            post = new Post();
            post.video_url = "www.photo-url.com";
            post.state = "published";
            shareCtrl.post = post;
        });

        it('should return True when the post has a video_url', function() {
            expect(shareCtrl.showVideo()).toBe(true);
        });

        it('should return false when the post is deleted', function() {
            shareCtrl.post.state = "deleted";
            expect(shareCtrl.showVideo()).toBe(false);
        });

        it('should return false when the post does not have a video_url', function() {
            shareCtrl.post.video_url = null;
            expect(shareCtrl.showVideo()).toBe(false);
            shareCtrl.post.video_url = "";
            expect(shareCtrl.showVideo()).toBe(false);
            shareCtrl.post.video_url = undefined;
            expect(shareCtrl.showVideo()).toBe(false);
        });
    });

    describe('getVideoUrl()', function() {
        var post;

        beforeEach(function() {
            post = new Post();
            post.video_url = "www.photo-url.com";
            post.state = "published";
            shareCtrl.post = post;
        });

        it('should return undefined', function() {
            shareCtrl.post.video_url = undefined;
            expect(shareCtrl.getVideoUrl()).toBe(undefined);
        });

        it('should return the embed Youtube url', function() {
            shareCtrl.post.video_url = 'https://www.youtube.com/watch?v=3T3g8rV-5GU';
            expect(shareCtrl.getVideoUrl()).toBe('https://www.youtube.com/embed/3T3g8rV-5GU');
        });
    });

    describe('addPostTimeline()', function() {

        it('should add post in posts', function() {
            expect(shareCtrl.posts).not.toContain(newPost);
            shareCtrl.addPostTimeline(newPost);

            expect(shareCtrl.posts).toContain(newPost);
        });
        
        it("shouldn't add post in posts", function() {
            shareCtrl.addPost = false;
            expect(shareCtrl.posts).not.toContain(newPost);
            shareCtrl.addPostTimeline(newPost);
            
            expect(shareCtrl.posts).not.toContain(newPost);
        });
    });
}));