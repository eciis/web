'use strict';

(describe('Test PostPageController', function () {

    let postCtrl, scope, httpBackend, postService, state, clipboard, messageService, mdDialog, q;

    var institutions = [
        { name: 'Splab', key: '098745' },
        { name: 'e-CIS', key: '456879' }
    ];

    var post = new Post({
        'title': 'Shared Post',
        'text': 'This post will be shared',
        'photo_url': null,
        'key': '12300',
        subscribers: []
    }, institutions[1].institution_key);

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, PostService, $state, ngClipboard, 
        MessageService, $mdDialog, $q, AuthService, $rootScope) {
        httpBackend = $httpBackend;
        state = $state;
        postService = PostService;
        clipboard = ngClipboard;
        messageService = MessageService;
        mdDialog = $mdDialog;
        q = $q;
        scope = $rootScope.$new();
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);

        AuthService.getCurrentUser = function () {
            return new User({key: 'aopsdkopdaskospdpokdskop'});
        };

        spyOn(postService, 'getPost').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback(post);
                }
            };
        });

        state.params.key = post.key
        postCtrl = $controller('PostPageController', {
            PostService: postService,
            state: state,
            scope: scope
        });

        postCtrl.$onInit();
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('isHidden()', function () {
        let result;

        beforeEach(() => {
            expect(postService.getPost).toHaveBeenCalledWith(post.key);
        });

        it('should return false', function () {
            expect(postService.getPost).toHaveBeenCalledWith(post.key);
            postCtrl.post.state = 'deleted';

            result = postCtrl.isHiden();
            expect(result).toEqual(false);

            postCtrl.post.state = 'published';
            postCtrl.post.number_of_comments = 10;
            postCtrl.post.number_of_likes = 10;

            result = postCtrl.isHiden();
            expect(result).toEqual(false);
        });

        it('should return true', function () {
            postCtrl.post.state = 'deleted';
            postCtrl.post.number_of_comments = 0;
            postCtrl.post.number_of_likes = 0;

            result = postCtrl.isHiden();
            expect(result).toEqual(true);
        });
    });

    describe('copyLink()', () => {
        it('should call toClipboard', () => {
            spyOn(Utils, 'generateLink');
            spyOn(clipboard, 'toClipboard');
            spyOn(messageService, 'showToast');

            postCtrl.copyLink();

            expect(Utils.generateLink).toHaveBeenCalled();
            expect(clipboard.toClipboard).toHaveBeenCalled();
            expect(messageService.showToast).toHaveBeenCalled();
        });
    });

    describe('reloadPost()', () => {
        
    });

    describe('share()', () => {
        it('should call show', () => {
            spyOn(mdDialog, 'show');

            postCtrl.share('$event');

            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('addSubscriber()', () => {
        it('should call addSubscriber', () => {
            spyOn(postService, 'addSubscriber').and.callFake(() => {
                return q.when();
            });
            spyOn(messageService, 'showToast');

            postCtrl.addSubscriber();
            scope.$apply();

            expect(postService.addSubscriber).toHaveBeenCalled();
            expect(messageService.showToast).toHaveBeenCalled();
            expect(postCtrl.post.subscribers).toEqual([postCtrl.user.key]);
        });
    });

    describe('removeSubscriber()', () => {
        it('should call removeSubscriber', () => {
            spyOn(postService, 'removeSubscriber').and.callFake(() => {
                return q.when();
            });
            spyOn(messageService, 'showToast');

            postCtrl.removeSubscriber();
            scope.$apply();

            expect(postService.removeSubscriber).toHaveBeenCalled();
            expect(messageService.showToast).toHaveBeenCalled();
        });
    });

    describe('isSubscriber()', () => {
        it('should be truthy', () => {
            postCtrl.post.subscribers.push(postCtrl.user.key);
            expect(postCtrl.isSubscriber()).toBeTruthy();
        });

        it('should be falsy', () => {
            postCtrl.post.subscribers = [];
            expect(postCtrl.isSubscriber()).toBeFalsy();
        });
    });

    describe('generateToolbarOptions()', () => {
        it('should set defaultToolbrOptions', () => {
            postCtrl.defaultToolbarOptions = [];

            postCtrl.generateToolbarOptions();

            expect(postCtrl.defaultToolbarOptions.length).toEqual(6);
        });
    });

    describe('reloadPost()', () => {
        it('should call getPost', () => {
            spyOn(Object, 'values');
            postCtrl.reloadPost();

            expect(postService.getPost).toHaveBeenCalled();
            expect(Object.values).toHaveBeenCalled();
        });
    });
}));