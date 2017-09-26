'use strict';

(describe('Test SharePostController', function() {

    var shareCtrl, scope, httpBackend, rootScope, mdDialog, postService, deffered, state;

    var institutions = [
        {name: 'Splab', key: '098745'},
        {name: 'e-CIS', key: '456879'}
    ];

    var maiana = {
        name: 'Maiana',
        institutions: institutions,
        follows: institutions,
        institutions_admin: institutions[0],
        current_institution: institutions[0]
    };

    maiana.current_institution = institutions[0];

    // Post of e-CIS by Maiana
    var post = new Post({'title': 'Shared Post',
                         'text': 'This post will be shared',
                         'photo_url': null,
                         'key': '12300'
                        },
                        institutions[1].institution_key);

    // Post of Splab by Maiana
    var newPost = new Post( {}, maiana.current_institution.key);
    newPost.shared_post = post.key;

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
        AuthService.login(maiana);

        shareCtrl = $controller('SharePostController', {
            scope: scope,
            user: maiana,
            posts: [post],
            post: post,
            institution: null
        });
        httpBackend.flush();
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

    describe('goToPost()', function() {
        it('Should call state.go', function() {
            spyOn(state, 'go').and.callThrough();
            shareCtrl.goToPost();
            expect(state.go).toHaveBeenCalledWith('app.post', Object({postKey: shareCtrl.post.key}));
        });
    });

    describe('share()', function() {
        it('Should call state.go', function() {
            var post = newPost;
            newPost.pdf_files = [];
            spyOn(postService, 'createPost').and.returnValue(deffered.promise);
            spyOn(mdDialog, 'hide');
            deffered.resolve(newPost);
            shareCtrl.share();
            scope.$apply();
            expect(postService.createPost).toHaveBeenCalledWith(post);
            expect(mdDialog.hide).toHaveBeenCalled();
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
}));