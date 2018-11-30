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
            expect(institutionService.getNextInstitutions).toHaveBeenCalledWith(1);
        });
    });

    describe('changeTab', () => {
        it('should set all institutions when nextTab = all', () => {
            allInstitutionsController.followingInstTab = true;
            allInstitutionsController.allInstTab = false;

            allInstitutionsController.changeTab('all');

            expect(allInstitutionsController.institutions).toEqual([
                institution, 
                other_institution, 
                fifthInst, 
                sixthInst
            ]);
            expect(allInstitutionsController.followingInstTab).toBe(false);
            expect(allInstitutionsController.allInstTab).toBe(true);
            expect(allInstitutionsController.memberInstTab).toBe(false);
        });

        it('should set followingInstitutions when nextTab = following', () => {
            expect(allInstitutionsController.followingInstTab).toBe(false);
            expect(allInstitutionsController.institutions).toEqual([
                institution,
                other_institution,
                fifthInst,
                sixthInst
            ]);
            
            allInstitutionsController.changeTab('following');

            expect(allInstitutionsController.institutions).toEqual([
                institution,
                fifthInst,
                sixthInst
            ]);
            expect(allInstitutionsController.followingInstTab).toBe(true);
            expect(allInstitutionsController.allInstTab).toBe(false);
            expect(allInstitutionsController.memberInstTab).toBe(false);
        });

        it('should set memberInstitutions when nextTab != all and following', () => {
            expect(allInstitutionsController.memberInstTab).toBe(false);
            expect(allInstitutionsController.institutions).toEqual([
                institution,
                other_institution,
                fifthInst,
                sixthInst
            ]);

            allInstitutionsController.changeTab('');

            expect(allInstitutionsController.institutions).toEqual([
                institution,
                fifthInst
            ]);
            expect(allInstitutionsController.followingInstTab).toBe(false);
            expect(allInstitutionsController.allInstTab).toBe(false);
            expect(allInstitutionsController.memberInstTab).toBe(true);
        });
    });
}));