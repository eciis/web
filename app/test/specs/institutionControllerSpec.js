'use strict';

(describe('Test InstitutionController', function() {

    var institutionCtrl, httpBackend, scope, institutionService, createCtrl, state;

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

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, InstitutionService, AuthService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        institutionService = InstitutionService;

        AuthService.getCurrentUser = function() {
            return new User(tiago);
        };

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

    describe('InstitutionController properties', function() {

        it('should exist a user and his name is Tiago', function() {
            expect(institutionCtrl.user.name).toEqual(tiago.name);
        });

        it('should exist posts', function() {
            expect(institutionCtrl.posts).toEqual(posts);
        });

        it('should exist members', function() {
            expect(institutionCtrl.members).toEqual([tiago]);
        });

        it('should exist followers', function() {
            expect(institutionCtrl.followers).toEqual([raoni]);
        });

        it('should exist currentInstitution', function() {
            expect(institutionCtrl.current_institution).toEqual(splab);
        });
    });
    
    describe('InstitutionController functions', function() {

        describe('follow()', function() {

            beforeEach(function() {
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
            });

            it('should call institutionService.follow() ', function(done) {
                var promise = institutionCtrl.follow();
                promise.then(function() {
                    expect(institutionService.follow).toHaveBeenCalledWith(splab.key);
                    done();
                });
                scope.$apply();
            });

            it('should call institutionService.getFollowers()', function(done) {
                var promise = institutionCtrl.follow();
                promise.then(function() {
                    expect(institutionService.getFollowers).toHaveBeenCalledWith(splab.key);
                    done();
                });
                scope.$apply();
            });

            it('should call user.follow()', function(done) {
                var promise = institutionCtrl.follow();
                promise.then(function() {
                    expect(institutionCtrl.user.follow).toHaveBeenCalledWith(splab.key);
                    done();
                });
                scope.$apply();
            });
        });

        describe('unfollow()', function() {

            beforeEach(function() {
                spyOn(institutionCtrl.user, 'isMember');
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
                spyOn(institutionCtrl.user, 'unfollow');
            });

            it('should call user.isMember()', function(done) {
                var promise = institutionCtrl.unfollow();
                promise.then(function() {
                    expect(institutionCtrl.user.isMember).toHaveBeenCalledWith(splab.key);
                    done();
                });
                scope.$apply();
            });

            it('should call institutionService.unfollow()', function(done) {
                var promise = institutionCtrl.unfollow();
                promise.then(function() {
                    expect(institutionService.unfollow).toHaveBeenCalledWith(splab.key);
                    done();
                });
                scope.$apply();
            });

            it('should call institutionService.getFollowers()', function(done) {
                var promise = institutionCtrl.unfollow();
                promise.then(function() {
                    expect(institutionService.getFollowers).toHaveBeenCalledWith(splab.key);
                    done();
                });
                scope.$apply();
            });

            it('should call user.unfollow()', function(done) {
                var promise = institutionCtrl.unfollow();
                promise.then(function() {
                    expect(institutionCtrl.user.unfollow).toHaveBeenCalledWith(splab.key);
                    done();
                });
                scope.$apply();
            });
        });

        describe('goToManageMembers()', function() {

            it('should call state.go(app.manage_institution.invite_user)', function() {
                spyOn(state, 'go');
                institutionCtrl.goToManageMembers('123456789');
                expect(state.go).toHaveBeenCalledWith('app.manage_institution.invite_user', {institutionKey: '123456789'});
            });
        });
    });
}));