'use strict';

(describe('Test InstitutionController', function () {

    var removeInstCtrl, httpBackend, scope, institutionService, createCtrl, state, mdDialog, 
    authService, messageService;

    var first_institution = {
        acronym: 'first_institution',
        key: '987654321',
        photo_url: "photo_url",
        actuation_area: "COMMISSION",
        legal_nature: "public"
    };

    var sec_institution = {
        acronym: 'sec_institution',
        key: '123456789',
        photo_url: "photo_url",
        actuation_area: "COMMISSION",
        legal_nature: "public"
    };

    var first_user = {
        name: 'first_user',
        institutions: [first_institution, sec_institution],
        follows: [sec_institution],
        institutions_admin: first_institution,
        current_institution: first_institution
    };

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, $q, $state, InstitutionService, AuthService,
        $mdDialog, $rootScope, MessageService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdDialog = $mdDialog;
        institutionService = InstitutionService;
        authService = AuthService;
        messageService = MessageService;

        httpBackend.when('GET', 'institution/removeInstDialog.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);

        authService.login(first_user);

        createCtrl = function () {
            return $controller('RemoveInstController',
                {
                    scope: scope,
                    institutionService: institutionService,
                    institution: first_institution,
                    loadStateView: function () { }
                });
        };

        spyOn(institutionService, 'removeInstitution').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback();
                }
            };
        });

        removeInstCtrl = createCtrl();
    }));

    afterEach(function () {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe("closeDialog()", function () {
        it('should call $mdDialog.cancel and loadStateView()', function () {
            spyOn(mdDialog, 'cancel');
            spyOn(removeInstCtrl, 'loadStateView');
            removeInstCtrl.closeDialog();
            expect(mdDialog.cancel).toHaveBeenCalled();
            expect(removeInstCtrl.loadStateView).toHaveBeenCalled();
        });
    });

    describe("removeInst", function () {
        it('should call removeInstitution', function () {
            spyOn(authService, 'save');
            spyOn(removeInstCtrl, 'closeDialog');
            spyOn(state, 'go');
            spyOn(messageService, 'showToast');
            removeInstCtrl.removeInst();
            expect(institutionService.removeInstitution).toHaveBeenCalled();
            expect(removeInstCtrl.user.institutions).toEqual([sec_institution]);
            expect(authService.save).toHaveBeenCalled();
            expect(removeInstCtrl.closeDialog).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalled();
            expect(messageService.showToast).toHaveBeenCalled();
        });

        it('should call authService.logout()', function() {
            spyOn(authService, 'logout');
            removeInstCtrl.user.institutions = [first_institution];
            removeInstCtrl.removeInst();
            expect(authService.logout).toHaveBeenCalled();
        })
    });

    describe("hasOneInstitution()", function () {
        beforeEach(function () {
            removeInstCtrl.user.institutions = [first_institution, sec_institution];
        });

        it('should be true', function() {
            removeInstCtrl.removeInst();
            var hasOneInstitution = removeInstCtrl.hasOneInstitution();
            expect(hasOneInstitution).toEqual(true);
        });

        it('should be false', function() {
            var hasOneInstitution = removeInstCtrl.hasOneInstitution();
            expect(hasOneInstitution).toEqual(false);
        });
    });

    describe("thereIsNoChild()", function () {
        it('should be true', function () {
            var thereIsNoChild = removeInstCtrl.thereIsNoChild();
            expect(thereIsNoChild).toEqual(true);
        });

        it('should be false', function() {
            removeInstCtrl.institution.children_institutions = [sec_institution];
            var thereIsNoChild = removeInstCtrl.thereIsNoChild();
            expect(thereIsNoChild).toEqual(false);
        });
    });


    describe('goToInstitution()', () => {
        it('should call state.go and mdDialog.close', () => {
            spyOn(state, 'go');
            spyOn(removeInstCtrl, 'closeDialog');

            removeInstCtrl.goToInstitution();

            expect(state.go).toHaveBeenCalledWith('app.institution.timeline', {institutionKey: removeInstCtrl.institution.key});
            expect(removeInstCtrl.closeDialog).toHaveBeenCalled();
        });
    });
}));