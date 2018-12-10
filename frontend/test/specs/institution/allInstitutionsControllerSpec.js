'use strict';

(describe('AllInstitutionsController Test', function() {
    beforeEach(module('app'));

    var institution = {
        name: 'institution',
        key: '1'
    };

    var other_institution = {
        name: 'other_inst',
        key: '2'
    };

    var third_institution = {
        name: 'third_inst',
        key: '3'
    };

    var fourth_institution = {
        name: 'fourth_institution',
        key: '4'
    };

    const fifthInst = {
        name: 'fifthInst',
        key: '5'
    };

    const sixthInst = {
        name: 'sixthInst',
        key: '6'
    };

    var user = {
        name: 'test',
        key: 'sahdkjsahdkj-IHAKJHAJKH8789AJHSJKHSA',
        follows: [institution, fifthInst, sixthInst],
        institutions: [institution, fifthInst]
    };

    var authService, institutionService, allInstitutionsController, scope;

    beforeEach(inject(function(AuthService, InstitutionService, $controller, $rootScope, $httpBackend) {
        authService = AuthService;
        institutionService = InstitutionService;
        scope = $rootScope;

        authService.login(user);
        spyOn(Utils, 'setScrollListener').and.callFake(function() {});

        spyOn(institutionService, 'getNextInstitutions').and.callFake(() => {
            return {
                then: function (callback) {
                    return callback({
                                institutions: [
                                institution,
                                other_institution,
                                fifthInst,
                                sixthInst
                            ], next: true
                        }
                    )
                }
            }
        })

        allInstitutionsController = $controller('AllInstitutionsController', {
            authService: AuthService,
            institutionService: InstitutionService
        });

        allInstitutionsController.$onInit();
    }));


    describe('Test getInstitutions()', function() {

        it('Should return all institutions', function() {
            expect(allInstitutionsController.getInstitutions()).toEqual([institution, other_institution, fifthInst, sixthInst]);
            allInstitutionsController.filterKeyword = "*";
            expect(allInstitutionsController.getInstitutions()).toEqual([institution, other_institution, fifthInst, sixthInst]);
        });

        it('Should return institution found', function() {
            allInstitutionsController.filterKeyword = "institution";
            expect(allInstitutionsController.getInstitutions()).toEqual([institution]);
            allInstitutionsController.filterKeyword = "other_inst";
            expect(allInstitutionsController.getInstitutions()).toEqual([other_institution]);
        });

        it('Shuld return empty list', function() {
            allInstitutionsController.filterKeyword = "institution_inst";
            expect(allInstitutionsController.getInstitutions()).toEqual([]);
        });
    });

    describe('Test loadMoreInstitutions()', function() {
        it('Should call getNextInstitution', function() {
            allInstitutionsController.loadMoreInstitutions();
            expect(institutionService.getNextInstitutions).toHaveBeenCalledWith(1, allInstitutionsController.currentTab);
        });
    });

    describe('changeTab', () => {
        it('should set currentTab to all', () => {
            allInstitutionsController.changeTab('all');
            expect(allInstitutionsController.currentTab).toEqual('all');
            expect(institutionService.getNextInstitutions).toHaveBeenCalled();
        });

        it('should set currentTab to following', () => {
            allInstitutionsController.changeTab('following');
            expect(allInstitutionsController.currentTab).toEqual('following');
            expect(institutionService.getNextInstitutions).toHaveBeenCalled();
        });

        it('should set currentTab to member', () => {
            allInstitutionsController.changeTab('member');
            expect(allInstitutionsController.currentTab).toEqual('member');
            expect(institutionService.getNextInstitutions).toHaveBeenCalled();
        });

        it('should not change the currentTab', () => {
            allInstitutionsController.changeTab('tst');
            expect(allInstitutionsController.currentTab).toEqual('all');
            expect(institutionService.getNextInstitutions).toHaveBeenCalled();
        });
    });
}));