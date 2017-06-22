'use strict';

(describe('Test HomeController', function() {
    var homeCtrl, httpBackend, deffered, scope;
    var user = {
        name: 'Tiago'
    };
    var institutions = [{
        name: 'Certbio',
        key: '123456789'
    }];
    var posts = [{
        author: 'Mayza Nunes',
        author_key: "sad4s6d51cas65d48wq97easd",
    }];
    var splab = {
            name: 'SPLAB',
            key: '987654321' 
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        deffered = $q.defer();
        var authRequest = httpBackend.when('GET', '/api/user').respond(user);
        var institutionRequest = httpBackend.when('GET', '/api/institutions').respond(institutions);
        var timelineRequest = httpBackend.when('GET', '/api/user/timeline').respond(posts);
        homeCtrl = $controller('HomeController', {scope: scope});
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('Verify username', function() {        
        expect(homeCtrl.user.name).toEqual('Tiago');
    });

    it('Verify the length of the posts array after initialize HomeController', function() {
        expect(homeCtrl.posts.length).toBe(1);
    });

    it('Verify the content of posts array', function() {
        expect(homeCtrl.posts).toContain({author: 'Mayza Nunes', author_key: 'sad4s6d51cas65d48wq97easd'});
    });

    it('Verify the length of the institutions array after initialize HomeController', function() { 
        expect(homeCtrl.institutions.length).toBe(1);
    });

    it('Verify the content of institutions array', function() {
        expect(homeCtrl.institutions).toContain({name: 'Certbio', key: '123456789'});
    });

    it('Test goToInstitution method and spy the calls inside', inject(function($state) {
        spyOn($state, 'go');
        homeCtrl.goToInstitution('123456789');
        expect($state.go).toHaveBeenCalled();
        expect($state.go).toHaveBeenCalledWith('app.institution', {institutionKey: '123456789'});
    }));

    it('Test newPost method and spy the calls inside', inject(function($mdDialog) {
        spyOn($mdDialog, 'show');
        homeCtrl.newPost('$event');
        expect($mdDialog.show).toHaveBeenCalled();       
    }));

    it('Test expandInstMenu method', function() {
        expect(homeCtrl.instMenuExpanded).toBe(false);
        homeCtrl.expandInstMenu();
        expect(homeCtrl.instMenuExpanded).toBe(true);
    });

    it('Test follow method', inject(function(InstitutionService) {
        spyOn(InstitutionService, 'follow').and.returnValue(deffered.promise);
        spyOn(homeCtrl.user, 'follow');
        deffered.resolve();
        homeCtrl.follow(splab);
        scope.$apply();
        expect(InstitutionService.follow).toHaveBeenCalled();
        expect(InstitutionService.follow).toHaveBeenCalledWith(splab.key);
        expect(homeCtrl.user.follow).toHaveBeenCalled();
        expect(homeCtrl.user.follow).toHaveBeenCalledWith(splab.key);
    }));

    it('Test unfollow method', function() {
        /*TODO:
        spyOn(homeCtrl, 'unfollow');
        homeCtrl.unfollow(splab);
        expect(homeCtrl.unfollow).toHaveBeenCalled();
        expect(homeCtrl.unfollow).toHaveBeenCalledWith(splab);
        */
    });
}));