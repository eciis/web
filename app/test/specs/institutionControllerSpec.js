'use strict';

(describe('Test InstitutionController', function() {
    var institutionCtrl, httpBackend, scope, deffered, institutionService, createCtrl, state;

    var INSTITUTIONS_URI = "/api/institutions/";

    var tiago = {
        name: 'Tiago',
        institutions: '987654321',
        follows: '987654321'
    };

    var raoni = {
        name: 'Raoni',
        institutions: '',
        follows: '987654321'
    };

    var splab = {
            name: 'SPLAB',
            key: '987654321' 
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
        state= $state;
        institutionService = InstitutionService;
        httpBackend.when('GET', '/api/user').respond(tiago);
        httpBackend.when('GET', INSTITUTIONS_URI + splab.key).respond(splab);
        httpBackend.when('GET', INSTITUTIONS_URI + splab.key + '/timeline').respond(posts);
        httpBackend.when('GET', INSTITUTIONS_URI + splab.key + '/members').respond([raoni]);
        httpBackend.when('GET', INSTITUTIONS_URI + splab.key + '/followers').respond([raoni]);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        createCtrl = function() {
            return $controller('InstitutionController', {scope: scope, state: state});
        };
        institutionCtrl = createCtrl();
        scope.$apply();
        scope.$digest();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('Verify the currentInstitutionKey', function() {
        expect(institutionCtrl.current_institution).toEqual(splab);
    });

    it('Spy getTimeline in success case', function() {
        spyOn(institutionService, 'getTimeline').and.returnValue(deffered.promise);
        deffered.resolve(posts);
        var ctrl = createCtrl();
        scope.$apply();
        httpBackend.flush();
        expect(institutionService.getTimeline).toHaveBeenCalled();
    });

    it('Test follow method', function() {
        spyOn(institutionService, 'follow').and.returnValue(deffered.promise);
        spyOn(institutionCtrl.user, 'follow');
        deffered.resolve();
        institutionCtrl.follow(splab);
        scope.$apply();
        expect(institutionService.follow).toHaveBeenCalled();
        expect(institutionService.follow).toHaveBeenCalledWith(splab.key);
        expect(institutionCtrl.user.follow).toHaveBeenCalled();
        expect(institutionCtrl.user.follow).toHaveBeenCalledWith(splab.key);
    });

    it('Test unfollow method', function() {
        spyOn(institutionCtrl.user, 'isMember');
        spyOn(institutionService, 'unfollow').and.returnValue(deffered.promise);
        deffered.resolve();
        homeCtrl.unfollow(splab);
        scope.$apply();
        expect(institutionCtrl.user.isMember).toHaveBeenCalled();
        expect(institutionCtrl.user.isMember).toHaveBeenCalledWith(splab.key);
        expect(institutionService.unfollow).toHaveBeenCalled();
        expect(institutionService.unfollow).toHaveBeenCalledWith(splab.key);
    });
}));