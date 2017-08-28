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
                         'photo_url': null
                        },
                        institutions[1].institution_key);

    // Post of Splab by Maiana
    var newPost = new Post( {'share_post': post}, maiana.current_institution.key);

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $http, $mdDialog, $q,
            PostService, AuthService, $rootScope, $state) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        mdDialog = $mdDialog;
        state = $state;
        deffered = $q;
        postService = PostService;

        AuthService.login(maiana);

        shareCtrl = $controller('SharePostController', {scope: scope, 
                                                        user: maiana,
                                                        post: post});
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
}));