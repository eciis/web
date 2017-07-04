'use strict';

(describe('Test HomeController', function() {

    var homeCtrl, httpBackend, scope, createCtrl, mdDialog, state;
    var user = {
        name: 'Tiago'
    };

    var institutions = [{
        name: 'Certbio',
        key: '123456789'
    }];

    var posts = [{
        author: 'Mayza Nunes',
        author_key: "111111",
    }];

    var splab = {
            name: 'SPLAB',
            key: '987654321' 
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, InstitutionService, PostService, $mdDialog, $state) {

        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        mdDialog = $mdDialog;
        state = $state;
        httpBackend.expect('GET', '/api/user').respond(user);
        httpBackend.expect('GET', '/api/user/timeline').respond(posts);
        httpBackend.expect('GET', '/api/institutions').respond(institutions);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);
        createCtrl = function() {
            return $controller('HomeController', {
                scope: scope
            });
        };
        homeCtrl = createCtrl();
        httpBackend.flush();   
    }));

    afterEach(function() {

        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('Verify properties before initialize InstitutionController', function() {

        it('Verify username', function() {        
            expect(homeCtrl.user.name).toEqual('Tiago');
        });

        it('Verify the length of the posts array after initialize HomeController', function() {
            expect(homeCtrl.posts.length).toBe(1);
        });

        it('Verify the content of posts array', function() {
            expect(homeCtrl.posts).toContain({author: 'Mayza Nunes', author_key: '111111'});
        });

        it('Verify the length of the institutions array after initialize HomeController', function() { 
            expect(homeCtrl.institutions.length).toBe(1);
        });

        it('Verify the content of institutions array', function() {
            expect(homeCtrl.institutions).toContain({name: 'Certbio', key: '123456789'});
        });
    });

    describe('Test HomeController methods', function() {

        it('Test goToInstitution method and spy the calls inside', function() {
            spyOn(state, 'go');
            homeCtrl.goToInstitution('123456789');
            expect(state.go).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalledWith('app.institution', {institutionKey: '123456789'});
        });

        it('Test newPost method and spy the calls inside', function() {
            spyOn(mdDialog, 'show');
            homeCtrl.newPost('$event');
            expect(mdDialog.show).toHaveBeenCalled();       
        });

        it('Test expandInstMenu method', function() {
            expect(homeCtrl.instMenuExpanded).toBe(false);
            homeCtrl.expandInstMenu();
            expect(homeCtrl.instMenuExpanded).toBe(true);
        });
    });
}));