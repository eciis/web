'use strict';

describe('Test ConfigInstDirective', function() {
    var editInstCtrl, scope, institutionService, state, deferred;
    var mdToast, mdDialog, http, inviteService, httpBackend, imageService;
    var authService, createCtrl, pdfService, messageService;

    var address = {
        cep: "11111-000",
        city: "city",
        country: "Country",
        neighbourhood: "neighbourhood",
        number: "555",
        state: "State",
        street: "Street x"
    };

    var institution = {
            name: "name",
            photo_url: "imagens/test",
            email: "email",
            state: "pending",
            key: "inst-key",
            acronym: "INST",
            legal_nature: "public",
            actuation_area: "government agencies",
            phone_number: "phone",
            cnpj: "cnpj",
            address: new Address(address),
            leader: "leader name",
            institutional_email: "email@institutional.com",
            description: "teste"
    };

    var institution_info = {
        photo_url: "imagens/test",
        key: "inst-key",
        acronym: "INST",
        legal_nature: "public",
        actuation_area: "government agencies",
    };

    var institutions = [{
        name: 'Splab',
        key: 'institutuion_key',
        portfolio_url: '',
        followers: [],
        members: []
    }];

    var legal_nature = {
        "private for-profit":"Privada com fins lucrativos",
        "private non-profit":"Privada sem fins lucrativos",
        "public":"Pública",
        "startup":"Startup" 
    };
    var actuation_area = {
        "OFFICIAL_BANK": "Banco Oficial",
        "COMMISSION": "Comissão",
        "COUNCIL": "Conselho",
        "PRIVATE_COMPANY": "Empresa Privada",
    };

    var invite = {'invitee': 'user@email.com',
            'suggestion_institution_name': "Suggested Name",
            'type_of_invite': "INSTITUTION",
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
        invites: [invite],
        state: 'active'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $q, $state, $mdToast,
        $rootScope, $mdDialog, $http, InstitutionService, InviteService, AuthService, PdfService, ImageService, MessageService) {
        httpBackend = $httpBackend;
        httpBackend.expectGET('app/institution/legal_nature.json').respond(legal_nature);
        httpBackend.expectGET('app/institution/actuation_area.json').respond(actuation_area);
        httpBackend.expectGET('app/institution/countries.json').respond({});
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

    describe('initController()', function() {

        it('isSubmission should be false when the institutionKey exists', function() {
            editInstCtrl.institutionKey = institution.key;
            spyOn(institutionService, 'getInstitution').and.callFake(function() {
                return {
                    then: function(callback) {
                        return callback({name: 'inst', portfolio_url: 'url'});
                    }
                };
            });

            editInstCtrl.initController();
            expect(editInstCtrl.isSubmission).toBeFalsy();
        });

        it('isSubmission should be true when institutionKey not exists, user is inactive and no has invites', function() {
            editInstCtrl.institutionKey = undefined;
            editInstCtrl.user.state = 'pending';
            editInstCtrl.user.invites = [];
            editInstCtrl.initController();
            expect(editInstCtrl.isSubmission).toBeTruthy();
        });

        it('shoul call state.go when user has pending institution invites', function() {
            spyOn(state, 'go');
            editInstCtrl.institutionKey = undefined;
            editInstCtrl.user.state = 'pending';
            editInstCtrl.user.invites = [invite];
            editInstCtrl.initController();
            expect(state.go).toHaveBeenCalledWith('signin');
        });

        afterEach(function() {
            editInstCtrl.institutionKey = institution.key;
            editInstCtrl.user.state = 'active';
            editInstCtrl.user.invites = [invite];
        });
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
                expect(editInstCtrl.user.follows).toContain(institution_info);
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
                country: "Brazil"
            };
            expect(editInstCtrl.getStep(1)).toEqual(true);
            editInstCtrl.newInstitution.address = {
                country: ""
            };
            expect(editInstCtrl.getStep(1)).toEqual(true);
        });

        it('should not pass from first step', function() {
            editInstCtrl.newInstitution.address = undefined;
            editInstCtrl.nextStep();
            expect(editInstCtrl.getStep(1)).toEqual(true);
            editInstCtrl.newInstitution.address = {
                country: ""
            };
            expect(editInstCtrl.getStep(1)).toEqual(true);
        });

        it('should not pass from second step', function() {
            editInstCtrl.nextStep();
            expect(editInstCtrl.steps).toEqual([false, true, false]);
            editInstCtrl.newInstitution.name = "";
            editInstCtrl.nextStep();
            expect(editInstCtrl.steps).toEqual([false, true, false]);
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

    describe('getPortfolioButtonMessage()', function() {
        it('should return "Trocar Portfólio"', function() {
            editInstCtrl.newInstitution.portfolio_url = "portfolio/test";
            var message = editInstCtrl.getPortfolioButtonMessage();
            expect(message).toEqual("Trocar Portfólio");
            delete editInstCtrl.newInstitution.portfolio_url;
            editInstCtrl.file = "portfolio/test";
            message = editInstCtrl.getPortfolioButtonMessage();
            expect(message).toEqual("Trocar Portfólio");
            editInstCtrl.newInstitution.portfolio_url = "portfolio/test";
            message = editInstCtrl.getPortfolioButtonMessage();
            expect(message).toEqual("Trocar Portfólio");
        });

        it('should return "Adicionar Portfólio"', function () {
            var message = editInstCtrl.getPortfolioButtonMessage();
            expect(message).toEqual("Adicionar Portfólio");
        });
    });

    describe('getPortfolioButtonIcon()', function () {
        it('should return "insert_drive_file"', function () {
            editInstCtrl.newInstitution.portfolio_url = "portfolio/test";
            var message = editInstCtrl.getPortfolioButtonIcon();
            expect(message).toEqual("insert_drive_file");
            delete editInstCtrl.newInstitution.portfolio_url;
            editInstCtrl.file = "portfolio/test";
            message = editInstCtrl.getPortfolioButtonIcon();
            expect(message).toEqual("insert_drive_file");
            editInstCtrl.newInstitution.portfolio_url = "portfolio/test";
            message = editInstCtrl.getPortfolioButtonIcon();
            expect(message).toEqual("insert_drive_file");
        });

        it('should return "attach_file"', function () {
            var message = editInstCtrl.getPortfolioButtonIcon();
            expect(message).toEqual("attach_file");
        });
    });
});
