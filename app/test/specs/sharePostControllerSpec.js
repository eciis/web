'use strict';

(describe('Test SharePostController', function() {

    var shareCtrl, scope, httpBackend, rootScope, mdDialog, postService, posts, mdDialog;

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
    var post = new Post(
                        {'title': 'Shared Post', 'text': 'This post will be shared'},
                        institutions[1].institution_key);

    // Post of Splab by Maiana
    var newPost = new Post(
                        {'title': 'Post sharing', 'text': 'This is the sharing'}, 
                        maiana.current_institution.key);

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $http, $mdDialog,
            PostService, AuthService, $rootScope) {
        scope = $rootScope.$new();
        httpBackend = $httpBackend;
        rootScope = $rootScope;
        mdDialog = $mdDialog;
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

    describe('isPostValid()', function() {
        
        it('Should return true', function() {
           expect(shareCtrl.isPostValid()).toEqual(true);
        });

        it('Should return false', function() {
            var newPost = new Post(
                        {'title': 'Post sharing', 'text': ''}, 
                        shareCtrl.user.current_institution.key);
            expect(shareCtrl.isPostValid()).toEqual(false);
        });

        it('Should return false', function() {
            var newPost = new Post(
                        {'title': '', 'text': 'This is the sharing'}, 
                        shareCtrl.user.current_institution.key);
            expect(shareCtrl.isPostValid()).toEqual(false);
        });
    });
}));