'use strict';

(describe('Test InstitutionLinksController', function() {

    var instLinksCtrl, httpBackend, scope, institutionService, createCtrl, state;

    var INSTITUTIONS_URI = "/api/institutions/";

    var parent_institution_test = {
        name: 'parentInst',
        key: 'parentKey',
    };

    var children_institutions_test = [
        {
            name: 'childrenInst1',
            key: 'chldKey1'
        },
        {
            name: 'childrenInst2',
            key: 'chldKey2'
        }
    ];

    var institution = {
        acronym: 'institution',
        key: '987654321',
        parent_institution: parent_institution_test,
        children_institutions: children_institutions_test
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, 
            InstitutionService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        institutionService = InstitutionService;

        httpBackend.expect('GET', INSTITUTIONS_URI + institution.key).respond(institution);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', 'institution/removeInstDialog.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);

        createCtrl = function() {
            return $controller('InstitutionLinksController',
                {
                    scope: scope,
                    institutionService: institutionService
                });
        };

        state.params.institutionKey = institution.key;
        instLinksCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('InstitutionLinksController properties', function() {

        it('The flag to indicate if is loading institutions should be false', function() {
            expect(instLinksCtrl.isLoadingInsts).toBeFalsy();
        });

        it('Should has parent institution', function() {
            expect(instLinksCtrl.parentInstitution).toEqual(parent_institution_test);
        });

        it('Should has two children institutions', function() {
            expect(instLinksCtrl.childrenInstitutions.length).toEqual(2);
        });

    });

    describe('InstitutionLinksController functions', function() {

        it('goToInst() should call window.open', function() {
            spyOn(window, 'open');
            instLinksCtrl.goToInst(parent_institution_test.key);
            expect(window.open).toHaveBeenCalledWith('/institution/' + parent_institution_test.key + '/home', '_blank');
        });

        it('hasInstitutions() should return true if has parent institution or has children institution', function() {
            expect(instLinksCtrl.hasInstitutions()).toBeTruthy();
        });

        it('hasInstitutions() should return false if no has parent institution and no has children institutions', function() {
            instLinksCtrl.parentInstitution = {};
            instLinksCtrl.childrenInstitutions = [];
            expect(instLinksCtrl.hasInstitutions()).toBeFalsy();
        });

        it('hasParentInst() should return true if has parent institution', function() {
            expect(instLinksCtrl.hasParentInst()).toBeTruthy();
        });

        it('hasParentInst() should return false if not has parent institution', function() {
            instLinksCtrl.parentInstitution = {};
            expect(instLinksCtrl.hasParentInst()).toBeFalsy();
        });

        it('hasChildrenInst() should return true if has at least one children institution', function() {
            expect(instLinksCtrl.hasChildrenInst()).toBeTruthy();
        });

        it('hasChildrenInst() should return false if not has at least one children institution', function() {
            instLinksCtrl.childrenInstitutions = [];
            expect(instLinksCtrl.hasChildrenInst()).toBeFalsy();
        });

        afterEach(function() {
            instLinksCtrl.parent_institution = parent_institution_test;
            instLinksCtrl.children_institutions = children_institutions_test;
        });
    });
}));