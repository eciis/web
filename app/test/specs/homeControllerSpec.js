'use strict';

(describe('Test HomeController', function() {
    var homeCtrl, httpBackend, deffered, scope, institutionService, postService, createCrtl;
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

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, InstitutionService, PostService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        deffered = $q.defer();
        institutionService = InstitutionService;
        postService = PostService;
        createCrtl = function() {
            return $controller('HomeController', {scope: scope});
        };
        httpBackend.when('GET', '/api/user').respond(user);
        httpBackend.when('GET', '/api/institutions').respond(institutions);
        httpBackend.when('GET', '/api/user/timeline').respond(posts);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'error/error.html').respond(200);
        homeCtrl = createCrtl();
        httpBackend.flush();   
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('Test loadPosts in success case', function() {
        spyOn(postService, 'get').and.returnValue(deffered.promise);
        deffered.resolve(posts);
        var ctrl = createCrtl();
        scope.$apply();
        httpBackend.flush();
        expect(postService.get).toHaveBeenCalled();
    });

    it('Test loadPosts in fail case and spy if $interval have been called', inject(function($interval) {
        spyOn(postService, 'get').and.returnValue(deffered.promise);
        spyOn($interval, 'cancel');
        deffered.reject({status: 400, data: {msg: 'Erro'}});
        var ctrl = createCrtl();
        scope.$apply();
        httpBackend.flush();
        expect(postService.get).toHaveBeenCalled();
        expect($interval.cancel).toHaveBeenCalled();
    }));

    it('Test getInstitutions in success case', function() {
        spyOn(institutionService, 'getInstitutions').and.returnValue(deffered.promise);
        deffered.resolve(institutions);
        var ctrl = createCrtl();
        scope.$apply();
        httpBackend.flush();
        expect(institutionService.getInstitutions).toHaveBeenCalled();
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
}));