'use strict';

(describe('Test InstitutionLinksController', function() {

    var instLinksCtrl, httpBackend, scope, institutionService, createCtrl, state;

    var INSTITUTIONS_URI = "/api/institutions/";

    var parentInstitutionTest = {
        name: 'parentInst',
        key: 'parentKey',
        state: 'active',
        children_institutions: [{key: '987654321'}]
    };

    var institution = {
        acronym: 'institution',
        key: '987654321',
        parent_institution: parentInstitutionTest
    };

    var childrenInstitutionsTest = [
        {
            name: 'childrenInst1',
            key: 'chldKey1',
            state: 'active',
            parent_institution: institution.key
        },
        {
            name: 'childrenInst2',
            key: 'chldKey2',
            state: 'active',
            parent_institution: null
        }
    ];

    institution.children_institutions = childrenInstitutionsTest;

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, 
            InstitutionService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        institutionService = InstitutionService;

        httpBackend.expect('GET', INSTITUTIONS_URI + institution.key).respond(institution);

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
            expect(instLinksCtrl.parentInstitution).toEqual(parentInstitutionTest);
        });

        it('Should has two children institutions', function() {
            expect(instLinksCtrl.childrenInstitutions.length).toEqual(2);
        });
    });

    describe('InstitutionLinksController functions', function() {

        describe('goToInst()', function() {

            it('should call window.open', function() {
                spyOn(window, 'open');
                instLinksCtrl.goToInst(parentInstitutionTest);
                expect(window.open).toHaveBeenCalledWith('/institution/' + parentInstitutionTest.key + '/home', '_blank');
            });
        });

        describe('hasInstitutions()', function() {

            it('should return true if has parent institution or has children institution', function() {
                expect(instLinksCtrl.hasInstitutions()).toBeTruthy();
            });

            it('should return false if no has parent institution and no has children institutions', function() {
                instLinksCtrl.parentInstitution = {};
                instLinksCtrl.childrenInstitutions = [];
                expect(instLinksCtrl.hasInstitutions()).toBeFalsy();
            });
        });

        describe('hasParentInst()', function() {

            it('should return true if has parent institution', function() {
                expect(instLinksCtrl.hasParentInst()).toBeTruthy();
            });

            it('should return false if not has parent institution', function() {
                instLinksCtrl.parentInstitution = {};
                expect(instLinksCtrl.hasParentInst()).toBeFalsy();
            });
        });

        describe('hasChildrenInst()', function() {

            it('hasChildrenInst() should return true if has at least one children institution', function() {
                expect(instLinksCtrl.hasChildrenInst()).toBeTruthy();
            });

            it('hasChildrenInst() should return false if not has at least one children institution', function() {
                instLinksCtrl.childrenInstitutions = [];
                expect(instLinksCtrl.hasChildrenInst()).toBeFalsy();
            });
        });

        describe('parentStatus()', function() {
            it('should return the string "Confirmado" when the status of link is confirmed', function() {
                expect(instLinksCtrl.parentStatus()).toEqual('Confirmado');
            });

            it('should return the string "Não confirmado" when the status of link is not confirmed', function() {
                instLinksCtrl.parentInstitution.children_institutions = [];
                expect(instLinksCtrl.parentStatus()).toEqual('Não confirmado');
            });
        });

        describe('childStatus()', function() {
            it('should return the string "Confirmado" when the status of link is confirmed', function() {
                expect(instLinksCtrl.childStatus(childrenInstitutionsTest[0])).toEqual('Confirmado');
            });

            it('should return the string "Não confirmado" when the status of link is not confirmed', function() {
                expect(instLinksCtrl.childStatus(childrenInstitutionsTest[1])).toEqual('Não confirmado');
            });
        });
    });
}));