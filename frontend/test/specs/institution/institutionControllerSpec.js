'use strict';

(describe('Test InstitutionController', function() {

    let institutionCtrl, httpBackend, scope, institutionService, createCtrl, state,
        mdDialog, cropImageService, imageService, utilsService, states;

    var INSTITUTIONS_URI = "/api/institutions/";

    var legal_nature = {
        "private for-profit":"Privada com fins lucrativos",
        "private non-profit":"Privada sem fins lucrativos",
        "public":"Pública" 
    };
    var area = {
        "OFFICIAL_BANK": "Banco Oficial",
        "COMMISSION": "Comissão",
        "COUNCIL": "Conselho",
        "PRIVATE_COMPANY": "Empresa Privada",
    };

    var first_institution = {
        acronym: 'first_institution',
        key: '987654321',
        photo_url: "photo_url",
        actuation_area : "COMMISSION",
        legal_nature : "public"
    };

    var sec_institution = {
        acronym: 'sec_institution',
        key: '123456789',
        photo_url: "photo_url",
        actuation_area : "COMMISSION",
        legal_nature : "public"
    };

    var first_user = {
        name: 'first_user',
        institutions: [first_institution],
        follows: [sec_institution],
        institutions_admin: first_institution,
        current_institution: first_institution
    };

    var sec_user = {
        name: 'sec_user',
        institutions: [sec_institution],
        follows: [first_institution]
    };

    var posts = [{
        author: 'sec_user',
        author_key: "abcdefg"
    }];

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, STATES,
            InstitutionService, AuthService, UtilsService, $mdDialog, CropImageService, ImageService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdDialog = $mdDialog;
        institutionService = InstitutionService;
        cropImageService = CropImageService;
        imageService = ImageService;
        utilsService = UtilsService;
        states = STATES;

        httpBackend.expect('GET', INSTITUTIONS_URI + first_institution.key).respond(first_institution);
        httpBackend.expectGET('app/institution/actuation_area.json').respond(area);
        httpBackend.expectGET('app/institution/legal_nature.json').respond(legal_nature);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', 'institution/removeInstDialog.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);

        AuthService.login(first_user);

        createCtrl = function() {
            return $controller('InstitutionController',
                {
                    scope: scope,
                    institutionService: institutionService
                });
        };

        state.params.institutionKey = first_institution.key;
        institutionCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('InstitutionController properties', function() {

        it('should exist a user and his name is first_user', function() {
            expect(institutionCtrl.user.name).toEqual(first_user.name);
        });
    });

    describe('InstitutionController functions', function() {

        it('Should is admin', function(){
            spyOn(institutionCtrl.user, 'isAdmin').and.callThrough();
            expect(institutionCtrl.isAdmin()).toEqual(true);
        });

        it('Should is not admin', function(){
            institutionCtrl.user.current_institution = sec_institution;

            spyOn(institutionCtrl.user, 'isAdmin').and.callThrough();
            expect(institutionCtrl.isAdmin()).toEqual(false);
        });

        it('Should isMember be true', function(){
            spyOn(institutionCtrl.user, 'isMember').and.callThrough();
            expect(institutionCtrl.isMember).toEqual(true);
        });

        it('Should isMember be false', function(){
            institutionCtrl.user.institutions = [sec_institution];
            spyOn(institutionCtrl.user, 'isMember').and.callThrough();
            institutionCtrl.checkIfUserIsMember();
            expect(institutionCtrl.isMember).toEqual(false);
        });

        describe('follow()', function() {

            beforeEach(function() {
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
                    expect(institutionService.follow).toHaveBeenCalledWith(first_institution.key);
                    done();
                });
                scope.$apply();
            });

            it('should call user.follow()', function(done) {
                first_institution = new Institution(first_institution);
                var promise = institutionCtrl.follow();
                promise.then(function() {
                    expect(institutionCtrl.user.follow).toHaveBeenCalledWith(first_institution);
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
                            return callback([sec_user]);
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
                    expect(institutionCtrl.user.isMember).toHaveBeenCalledWith(first_institution.key);
                    done();
                });
                scope.$apply();
            });

            it('should call institutionService.unfollow()', function(done) {
                var promise = institutionCtrl.unfollow();
                promise.then(function() {
                    expect(institutionService.unfollow).toHaveBeenCalledWith(first_institution.key);
                    done();
                });
                scope.$apply();
            });

            it('should call user.unfollow()', function(done) {
                var promise = institutionCtrl.unfollow();
                promise.then(function() {
                    expect(institutionCtrl.user.unfollow).toHaveBeenCalledWith(institutionCtrl.institution);
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

        describe('requestInvitation()', function() {

            it('should call $mdDialog.show()', function() {
                spyOn(mdDialog, 'show');
                institutionCtrl.requestInvitation('$event');
                expect(mdDialog.show).toHaveBeenCalled();
            });
        });

        describe('cropImage()', function () {
            beforeEach(function () {
                var image = createImage(100);

                spyOn(cropImageService, 'crop').and.callFake(function () {
                    return {
                        then: function (callback) {
                            return callback("Image");
                        }
                    };
                });

                spyOn(imageService, 'compress').and.callFake(function () {
                    return {
                        then: function (callback) {
                            return callback(image);
                        }
                    };
                });

                spyOn(imageService, 'readFile').and.callFake(function () {
                    institutionCtrl.institution.cover_photo = "Picture's base64 data";
                });

                spyOn(imageService, 'saveImage').and.callFake(function () {
                    return {
                        then: function (callback) {
                            return callback(image);
                        }
                    };
                });

                spyOn(institutionService, 'update').and.callFake(function () {
                    return {
                        then: function (callback) {
                            return callback(first_institution);
                        }
                    };
                });
            });

            it('should call all the image functions', function () {
                spyOn(institutionCtrl, 'addImage').and.callThrough();
                spyOn(institutionCtrl, 'saveImage').and.callThrough();
                var image = createImage(100);
                institutionCtrl.cropImage(image);
                expect(cropImageService.crop).toHaveBeenCalled();
                expect(institutionCtrl.addImage).toHaveBeenCalled();
                expect(imageService.compress).toHaveBeenCalled();
                expect(imageService.readFile).toHaveBeenCalled();
                expect(institutionCtrl.saveImage).toHaveBeenCalled();
                expect(imageService.saveImage).toHaveBeenCalled();
                expect(institutionService.update).toHaveBeenCalled();
            });
        });
        describe('goToEvents', function() {
            it('should call state.go with the right params', function(){
                spyOn(utilsService, 'selectNavOption');
                institutionCtrl.posts = posts;
                institutionCtrl.goToEvents(first_institution.key);
                expect(utilsService.selectNavOption).toHaveBeenCalledWith(
                    states.INST_EVENTS, 
                    {
                        institutionKey: first_institution.key,
                        posts: posts
                    }
                );
            });
        });
        describe('goToLinks()', function() {
            it('should call state.go', function() {
                spyOn(state, 'go');
                institutionCtrl.goToLinks(first_institution.key);
                expect(state.go).toHaveBeenCalledWith('app.institution.institutional_links', {institutionKey: first_institution.key});
            });
        });

        describe('getInstKey()', () => {
            it('should return $state.params.institutionKey', () => {
                const key = institutionCtrl.getInstKey();
                expect(key).toEqual(state.params.institutionKey);
            })
        })
    });
}));