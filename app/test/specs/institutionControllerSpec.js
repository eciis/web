'use strict';

(describe('Test InstitutionController', function() {
    var institutionCtrl, httpBackend, scope, deffered, institutionService, createCtrl, state;

    var INSTITUTIONS_URI = "/api/institutions/";

    var splab = {
            name: 'SPLAB',
            key: '987654321' 
    };

    var certbio = {
        name: 'CERTBIO',
        key: '123456789'
    };

    var tiago = {
        name: 'Tiago',
        institutions: splab.key,
        follows: certbio.key
    };

    var raoni = {
        name: 'Raoni',
        institutions: certbio.key,
        follows: splab.key
    };

    var posts = [{
        author: 'Raoni',
        author_key: "abcdefg"
    }];

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, $compile, InstitutionService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        deffered = $q.defer();
        state = $state;
        institutionService = InstitutionService;
        httpBackend.when('GET', '/api/user').respond(tiago);
        httpBackend.when('GET', INSTITUTIONS_URI + splab.key).respond(splab);
        httpBackend.when('GET', INSTITUTIONS_URI + splab.key + '/timeline').respond(posts);
        httpBackend.when('GET', INSTITUTIONS_URI + splab.key + '/members').respond([tiago]);
        httpBackend.when('GET', INSTITUTIONS_URI + splab.key + '/followers').respond([raoni]);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        createCtrl = function() {
            return $controller('InstitutionController', {scope: scope});
        };
        state.params.institutionKey = splab.key;
        institutionCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('Verify user', function() {
        expect(institutionCtrl.user.name).toEqual(tiago.name);
    });

    it('Verify posts', function() {
        expect(institutionCtrl.posts).toEqual(posts);
    });

    it('Verify members', function() {
        expect(institutionCtrl.members).toEqual([tiago]);
    });

    it('Verify followers', function() {
        expect(institutionCtrl.followers).toEqual([raoni]);
    });

    it('Verify currentInstitution', function() {
        expect(institutionCtrl.current_institution).toEqual(splab);
    });

    it('Test getTimeline on loadPosts in success case', function() {
        spyOn(institutionService, 'getTimeline').and.returnValue(deffered.promise);
        deffered.resolve(posts);
        state.params.institutionKey = splab.key;
        var ctrl = createCtrl();
        scope.$apply();
        httpBackend.flush();
        expect(institutionService.getTimeline).toHaveBeenCalledWith(splab.key);
    });

    it('Test getInstitution on loadInstitutions in success case', function() {
        spyOn(institutionService, 'getInstitution').and.returnValue(deffered.promise);
        deffered.resolve(splab);
        state.params.institutionKey = splab.key;
        var ctrl = createCtrl();
        scope.$apply();
        httpBackend.flush();
        expect(institutionService.getInstitution).toHaveBeenCalledWith(splab.key);
    });

    it('Test getInstitution on loadInstitutions in fail case and spy if state.go have been called', function() {
        spyOn(institutionService, 'getInstitution').and.returnValue(deffered.promise);
        spyOn(state, 'go');
        deffered.reject({status: 400, data: {msg: 'Erro'}});
        state.params.institutionKey = splab.key;
        var ctrl = createCtrl();
        scope.$apply();
        httpBackend.flush();
        expect(institutionService.getInstitution).toHaveBeenCalledWith(splab.key);
        expect(state.go).toHaveBeenCalledWith('app.home');
    });

    it('Test getMembers', function() {
        spyOn(institutionService, 'getMembers').and.returnValue(deffered.promise);
        deffered.resolve([tiago]);
        state.params.institutionKey = splab.key;
        var ctrl = createCtrl();
        scope.$apply();
        httpBackend.flush();
        expect(institutionService.getMembers).toHaveBeenCalledWith(splab.key);
    });

    it('Test getFollowers', function() {
        spyOn(institutionService, 'getFollowers').and.returnValue(deffered.promise);
        deffered.resolve([raoni]);
        state.params.institutionKey = splab.key;
        var ctrl = createCtrl();
        scope.$apply();
        httpBackend.flush();
        expect(institutionService.getFollowers).toHaveBeenCalledWith(splab.key);
    })

    it('Test follow method', function() {
        spyOn(institutionService, 'follow').and.returnValue(deffered.promise);
        spyOn(institutionCtrl.user, 'follow');
        deffered.resolve();
        institutionCtrl.follow();
        scope.$apply();
        httpBackend.flush();
        expect(institutionService.follow).toHaveBeenCalledWith(splab.key);
        expect(institutionCtrl.user.follow).toHaveBeenCalledWith(splab.key);
    });

    it('Test unfollow method', function() {
        spyOn(institutionCtrl.user, 'isMember');
        spyOn(institutionService, 'unfollow').and.returnValue(deffered.promise);
        deffered.resolve();
        institutionCtrl.unfollow();
        scope.$apply();
        httpBackend.flush();
        expect(institutionCtrl.user.isMember).toHaveBeenCalledWith(splab.key);
        expect(institutionService.unfollow).toHaveBeenCalledWith(splab.key);
    });
}));