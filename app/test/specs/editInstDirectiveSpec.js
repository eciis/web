'use strict';

describe('Test EditInstDirective', function() {
    var editInstCtrl, scope, institutionService, state, deferred;
    var mdToast, mdDialog, http, inviteService, httpBackend, imageService, authService, createCtrl;
    
    var institution = {
            name: "name",
            photo_url: "",
            email: "email",
            state: "active",
            key: "inst-key",
            acronym: "INST"
    };
    var institutions = [{
        name: 'Splab',
        key: 'institutuion_key',
        followers: [],
        members: []
    }];

    var legal_nature = [
        {"value":"public", "name":"Pública"},
        {"value":"private", "name":"Privada"},
        {"value":"philanthropic", "name":"Filantrópica"}
    ];
    var occupation_area = [
        {"value":"official laboratories", "name":"Laboratórios Oficiais"},
        {"value":"government agencies", "name":"Ministérios e outros Órgãos do Governo"},
        {"value":"funding agencies", "name":"Agências de Fomento"},
        {"value":"research institutes", "name":"Institutos de Pesquisa"},
        {"value":"colleges", "name":"Universidades"},
        {"value":"other", "name":"Outra"}
    ];
    var userData = {
        name: 'name',
        key: 'user-key',
        current_institution: {key: "institutuion_key"},
        institutions: institutions,
        invites: [{
            'invitee': 'user@email.com',
            'suggestion_institution_name': "Suggested Name",
            'type_of_invite': "institution",
            'status': 'sent'
        }]
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $q, $state, $mdToast,
        $rootScope, $mdDialog, $http, InstitutionService, InviteService, AuthService, ImageService) {
        httpBackend = $httpBackend;
        httpBackend.expectGET('institution/legal_nature.json').respond(legal_nature);
        httpBackend.expectGET('institution/occupation_area.json').respond(occupation_area);
        httpBackend.expect('GET', '/api/institutions/' + institution.key).respond(institution);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        scope = $rootScope.$new();
        state = $state;
        deferred = $q.defer();
        mdDialog = $mdDialog;
        institutionService = InstitutionService;
        inviteService = InviteService;
        mdToast = $mdToast;
        imageService = ImageService;
        authService = AuthService;
        http = $http;

        authService.getCurrentUser = function() {
            return new User(userData);
        };

        createCtrl = function() {
            return $controller('EditInstController', {
                    scope: scope,
                    authService: authService,
                    institutionService: institutionService,
                    imageService: imageService
                });
        };
        state.params.institutionKey = institution.key;
        editInstCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('addImage()', function() {
        var promise;

        beforeEach(function() {
            var image = createImage(100);
            spyOn(imageService, 'compress').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback(image);
                    }
                };
            });

            spyOn(imageService, 'readFile').and.callFake(function() {
                editInstCtrl.newInstitution.photo_url = "Base64 data of photo";
            });

            promise = editInstCtrl.addImage(image);
        });

        it('Should be call ImageService.compress', function(done) {

            promise.then(function() {
                expect(imageService.compress).toHaveBeenCalled();
                done();
            });
        });

        it('Should be call ImageService.readFile', function(done) {
            promise.then(function() {
                expect(imageService.readFile).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('submit()', function() {

        var promise;

        beforeEach(function() {
            spyOn(imageService, 'saveImage').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback({
                            url : "imagens/test"
                        });
                    }
                };
            });
            spyOn(mdDialog, 'show').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(institutionService, 'update').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
            spyOn(editInstCtrl.user, 'updateInstitutions');
            spyOn(authService, 'save');
            spyOn(state, 'go');

            editInstCtrl.photo_instituicao = 'base64Test';
            promise = editInstCtrl.submit('$event');
        });

        it('Should be call mdDialog.show', function(done) {
            promise.then(function() {
                expect(mdDialog.show).toHaveBeenCalled();
                done();
            });
        });

        it('Should be call ImageService.saveImage', function(done) {
            promise.then(function() {
                expect(imageService.saveImage).toHaveBeenCalled();
                done();
            });
        });

        it('Should be call InstitutionService.update', function(done) {
            promise.then(function() {
                expect(institutionService.update).toHaveBeenCalled();
                done();
            });
        });

        it('Should be call user.updateInstitutions', function(done) {
            promise.then(function() {
                expect(editInstCtrl.user.updateInstitutions).toHaveBeenCalled();
                done();
            });
        });

        it('Should be call AuthService.save', function(done) {
            promise.then(function() {
                expect(authService.save).toHaveBeenCalled();
                done();
            });
        });
    });
});