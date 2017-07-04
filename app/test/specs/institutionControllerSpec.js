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

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, InstitutionService) {

        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        institutionService = InstitutionService;
        httpBackend.expect('GET', '/api/user').respond(tiago);
        httpBackend.expect('GET', INSTITUTIONS_URI + splab.key + '/timeline').respond(posts);
        httpBackend.expect('GET', INSTITUTIONS_URI + splab.key).respond(splab);
        httpBackend.expect('GET', INSTITUTIONS_URI + splab.key + '/members').respond([tiago]);
        httpBackend.expect('GET', INSTITUTIONS_URI + splab.key + '/followers').respond([raoni]);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        createCtrl = function() {
            return $controller('InstitutionController',
                {
                    scope: scope,
                    institutionService: institutionService,
                });
        };
        state.params.institutionKey = splab.key;
        institutionCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {

        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('Verify properties before initialize InstitutionController', function() {

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
    });
    
    describe('Test InstitutionController methods', function() {

        it('Test follow method', function(done) {
            spyOn(institutionService, 'getFollowers').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback([raoni, tiago]);
                    }
                };
            });
            spyOn(institutionService, 'follow').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(institutionCtrl.user, 'follow');
            var promise = institutionCtrl.follow();
            promise.then(function() {
                expect(institutionService.follow).toHaveBeenCalledWith(splab.key);
                expect(institutionService.getFollowers).toHaveBeenCalledWith(splab.key);
                expect(institutionCtrl.user.follow).toHaveBeenCalledWith(splab.key);
                done();
            });
            scope.$apply();
        });

        it('Test unfollow method', function(done) {
            spyOn(institutionService, 'getFollowers').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback([raoni]);
                    }
                };
            });
            spyOn(institutionService, 'unfollow').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(institutionCtrl.user, 'isMember');
            spyOn(institutionCtrl.user, 'unfollow');
            var promise = institutionCtrl.unfollow();
            promise.then(function() {
                expect(institutionCtrl.user.isMember).toHaveBeenCalledWith(splab.key);
                expect(institutionService.unfollow).toHaveBeenCalledWith(splab.key);
                expect(institutionService.getFollowers).toHaveBeenCalledWith(splab.key);
                expect(institutionCtrl.user.unfollow).toHaveBeenCalledWith(splab.key);
                done();
            });
            scope.$apply();
        });
    });
}));