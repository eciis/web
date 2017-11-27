'use strict';

describe('Test ConfigInstDirective', function() {
    var editInstCtrl, scope, institutionService, state, deferred;
    var mdToast, mdDialog, http, inviteService, httpBackend, imageService;
    var authService, createCtrl, pdfService, messageService;

    var institution = {
            name: "name",
            photo_url: "",
            email: "email",
            state: "pending",
            key: "inst-key",
            acronym: "INST",
            legal_nature: "public",
            actuation_area: "government agencies",
            phone_number: "phone",
            cnpj: "cnpj",
            address: "address",
            leader: "leader name",
            institutional_email: "email@institutional.com"
    };

    var institutions = [{
        name: 'Splab',
        key: 'institutuion_key',
        portfolio_url: '',
        followers: [],
        members: []
    }];

    var legal_nature = [
        {"value":"public", "name":"Pública"},
        {"value":"private", "name":"Privada"},
        {"value":"philanthropic", "name":"Filantrópica"}
    ];
    var actuation_area = [
        {"value":"official laboratories", "name":"Laboratórios Oficiais"},
        {"value":"government agencies", "name":"Ministérios e outros Órgãos do Governo"},
        {"value":"funding agencies", "name":"Agências de Fomento"},
        {"value":"research institutes", "name":"Institutos de Pesquisa"},
        {"value":"colleges", "name":"Universidades"},
        {"value":"other", "name":"Outra"}
    ];

    var invite = {'invitee': 'user@email.com',
            'suggestion_institution_name': "Suggested Name",
            'type_of_invite': "institution",
            'status': 'sent',
            key: 'invite-key'
    };

    var userData = {
        name: 'name',
        key: 'user-key',
        current_institution: {key: "institutuion_key"},
        institutions: institutions,
        institutions_admin: [],
        follows: institutions,
        institution_profiles: [],
        email: ['test@test.com'],
        invites: [invite]
    };



    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $q, $state, $mdToast,
        $rootScope, $mdDialog, $http, InstitutionService, InviteService, AuthService, PdfService, ImageService, MessageService) {
        httpBackend = $httpBackend;
        httpBackend.expectGET('app/institution/legal_nature.json').respond(legal_nature);
        httpBackend.expectGET('app/institution/actuation_area.json').respond(actuation_area);
        httpBackend.expectGET('/api/institutions/' + institution.key).respond(institution);
        httpBackend.when('GET', 'main/main.html').respond(200);
        httpBackend.when('GET', 'home/home.html').respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        scope = $rootScope.$new();
        state = $state;
        deferred = $q.defer();
        mdDialog = $mdDialog;
        institutionService = InstitutionService;
        inviteService = InviteService;
        messageService = MessageService;
        mdToast = $mdToast;
        imageService = ImageService;
        authService = AuthService;
        pdfService = PdfService;
        http = $http;

        authService.login(userData);
        state.params.institutionKey = institution.key;
        createCtrl = function() {
            return $controller('ConfigInstController', {
                    scope: scope,
                    authService: authService,
                    institutionService: institutionService,
                    imageService: imageService
                });
        };

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
            spyOn(institutionService, 'update').and.returnValue(deferred.promise);
            spyOn(editInstCtrl.user, 'updateInstitutions').and.callThrough();
            spyOn(authService, 'save');
            spyOn(institutionService, 'save').and.returnValue(deferred.promise);
            spyOn(state, 'go');
            editInstCtrl.photo_instituicao = 'base64Test';
            promise = editInstCtrl.submit('$event');

        });

        it('should update the user', function(done) {
            state.params.inviteKey = invite.key;
            promise.then(function() {
                deferred.resolve(institution);
                scope.$apply();
                expect(institutionService.update).toHaveBeenCalled();
                expect(institutionService.save).toHaveBeenCalled();
                expect(editInstCtrl.user.updateInstitutions).toHaveBeenCalled();
                expect(authService.save).toHaveBeenCalled();
                expect(editInstCtrl.user.institutions).toContain(institution);
                expect(editInstCtrl.user.invites).toEqual([]);
                expect(editInstCtrl.user.institutions_admin).toContain(institution.key);
                expect(editInstCtrl.user.follows).toContain(institution);
                done();
            });
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
                deferred.resolve();
                scope.$apply();
                expect(institutionService.update).toHaveBeenCalled();
                done();
            });
        });

        it('Should be call user.updateInstitutions', function(done) {
            promise.then(function() {
                deferred.resolve();
                scope.$apply();
                expect(editInstCtrl.user.updateInstitutions).toHaveBeenCalled();
                done();
            });
        });

        it('Should be call AuthService.save', function(done) {
            promise.then(function() {
                deferred.resolve();
                scope.$apply();
                expect(authService.save).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('nextStep', function() {
        beforeEach(function() {
            editInstCtrl.steps = [true, false, false];
        });

        it('should go to next step', function() {
            editInstCtrl.nextStep();
            expect(editInstCtrl.steps).toEqual([false, true, false]);
            editInstCtrl.nextStep();
            expect(editInstCtrl.steps).toEqual([false, false, true]);
        });

        it('should call showToast', function() {
            spyOn(messageService, 'showToast');
            editInstCtrl.newInstitution.address = {};
            editInstCtrl.nextStep();
            expect(messageService.showToast).toHaveBeenCalled();
        });

        it('should not pass from first step', function() {
            editInstCtrl.newInstitution.address = undefined;
            editInstCtrl.nextStep();
            expect(editInstCtrl.getStep(1)).toEqual(true);
            editInstCtrl.newInstitution.address = {
                street: "floriano",
                city: "example",
                country: "brazil"
            };
            expect(editInstCtrl.getStep(1)).toEqual(true);
        });

        it('should not pass from second step', function() {
            editInstCtrl.nextStep();
            expect(editInstCtrl.steps).toEqual([false, true, false]);
            editInstCtrl.newInstitution.name = "";
            editInstCtrl.nextStep();
            expect(editInstCtrl.steps).toEqual([false, true, false]);
            editInstCtrl.newInstitution.name = "user";
            editInstCtrl.newInstitution.acronym = undefined;
            editInstCtrl.nextStep();
            expect(editInstCtrl.steps).toEqual([false, true, false]);
            editInstCtrl.newInstitution.acronym = "UFCG";
            editInstCtrl.newInstitution.actuation_area = undefined;
            editInstCtrl.nextStep();
            expect(editInstCtrl.steps).toEqual([false, true, false]);
            editInstCtrl.newInstitution.legal_nature = undefined;
            editInstCtrl.nextStep();
            expect(editInstCtrl.steps).toEqual([false, true, false]);
        });
    });

    describe('showGreenButton', function() {
        beforeEach(function() {
            editInstCtrl.steps = [true, false, false];
        });

        it('should return true', function() {
            editInstCtrl.nextStep();
            var greenButton = editInstCtrl.showGreenButton(2);
            expect(greenButton).toEqual(true);
            editInstCtrl.nextStep();
            greenButton = editInstCtrl.showGreenButton(2);
            expect(greenButton).toEqual(true);
            greenButton = editInstCtrl.showGreenButton(3);
            expect(greenButton).toEqual(true);
        });

        it('should return false', function() {
            var greenButton = editInstCtrl.showGreenButton(2);
            expect(greenButton).toEqual(false);
            editInstCtrl.nextStep();
            greenButton = editInstCtrl.showGreenButton(3);
            expect(greenButton).toEqual(false);
        });
    });
});