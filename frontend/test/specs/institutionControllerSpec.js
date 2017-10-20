'use strict';

(describe('Test InstitutionController', function() {

    var institutionCtrl, httpBackend, scope, institutionService, createCtrl, state, mdDialog;

    var INSTITUTIONS_URI = "/api/institutions/";

    var splab = {
        acronym: 'SPLAB',
        key: '987654321',
        photo_url: "photo_url"
    };

    var certbio = {
        acronym: 'CERTBIO',
        key: '123456789',
        photo_url: "photo_url"
    };

    var tiago = {
        name: 'Tiago',
        institutions: [splab],
        follows: [certbio],
        institutions_admin: splab,
        current_institution: splab
    };

    var raoni = {
        name: 'Raoni',
        institutions: [certbio],
        follows: [splab]
    };

    var posts = [{
        author: 'Raoni',
        author_key: "abcdefg"
    }];

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, InstitutionService, AuthService, UserService, $mdDialog) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdDialog = $mdDialog;
        institutionService = InstitutionService;

        httpBackend.expect('GET', INSTITUTIONS_URI + splab.key + '/timeline?page=0&&limit=10').respond({posts: posts, next: true});
        httpBackend.expect('GET', INSTITUTIONS_URI + splab.key).respond(splab);
        httpBackend.expect('GET', INSTITUTIONS_URI + splab.key + '/members').respond([tiago]);
        httpBackend.expect('GET', INSTITUTIONS_URI + splab.key + '/followers').respond([raoni]);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', 'institution/removeInstDialog.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);

        AuthService.login(tiago);

        createCtrl = function() {
            return $controller('InstitutionController',
                {
                    scope: scope,
                    institutionService: institutionService
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
            expect(institutionCtrl.current_institution.make()).toEqual(splab);
        });
    });

    describe('InstitutionController functions', function() {

        it('Should is admin', function(){
            spyOn(institutionCtrl.user, 'isAdmin').and.callThrough();
            expect(institutionCtrl.isAdmin()).toEqual(true);
        });

        it('Should is not admin', function(){
            institutionCtrl.user.current_institution = certbio;

            spyOn(institutionCtrl.user, 'isAdmin').and.callThrough();
            expect(institutionCtrl.isAdmin()).toEqual(false);
        });

        it('Should isMember be true', function(){
            spyOn(institutionCtrl.user, 'isMember').and.callThrough();
            expect(institutionCtrl.isMember).toEqual(true);
        });

        it('Should isMember be false', function(){
            institutionCtrl.user.institutions = [certbio];
            spyOn(institutionCtrl.user, 'isMember').and.callThrough();
            institutionCtrl.checkIfUserIsMember();
            expect(institutionCtrl.isMember).toEqual(false);
        });

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
                    expect(institutionCtrl.user.follow).toHaveBeenCalledWith(splab);
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
                    expect(institutionCtrl.user.unfollow).toHaveBeenCalledWith(institutionCtrl.current_institution);
                    done();
                });
                scope.$apply();
            });
        });

        describe('removeInstitution()', function() {

            it('should call $mdDialog.show()', function() {
                spyOn(mdDialog, 'show');
                institutionCtrl.removeInstitution('$event');
                expect(mdDialog.show).toHaveBeenCalled();
            });
        });

        describe('loadMorePosts()', function() {
            beforeEach(function() {
                spyOn(institutionService, 'getNextPosts').and.callFake(function() {
                    return {
                        then: function(callback) {
                            callback({data: {posts: posts, next: false}});
                        }
                    };
                });
            });

            it('Should call institutionService.getNextPosts()', function(done) {
                var promise = institutionCtrl.loadMorePosts();
                var actualPage = 1;

                promise.then(function success() {
                    expect(institutionService.getNextPosts).toHaveBeenCalledWith(splab.key, actualPage);
                    done();
                });

                scope.$apply();
            });
        });
    });
}));