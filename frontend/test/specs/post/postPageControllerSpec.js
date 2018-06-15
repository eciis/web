'use strict';

(describe('Test PostPageController', function () {

    var postCtrl, scope, httpBackend, postService, state;

    var institutions = [
        { name: 'Splab', key: '098745' },
        { name: 'e-CIS', key: '456879' }
    ];

    var post = new Post({
        'title': 'Shared Post',
        'text': 'This post will be shared',
        'photo_url': null,
        'key': '12300'
    }, institutions[1].institution_key);

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, PostService, $state) {
        httpBackend = $httpBackend;
        state = $state;
        postService = PostService;
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);

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
            state: state
        });

        
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
}));