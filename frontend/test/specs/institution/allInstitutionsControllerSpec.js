'use strict';

(describe('AllInstitutionsController Test', function() {
    beforeEach(module('app'));

    var user = {
        name: 'test',
        key: 'sahdkjsahdkj-IHAKJHAJKH8789AJHSJKHSA'
    };

    var institution = {
        name: 'institution'
    };

    var other_institution = {
        name: 'other_inst'
    };

    var authService, institutionService, allInstitutionsController;

    beforeEach(inject(function(AuthService, InstitutionService, $controller) {
        authService = AuthService;
        institutionService = InstitutionService;

        authService.login(user);
        spyOn(Utils, 'setScrollListener').and.callFake(function() {});

        allInstitutionsController = $controller('AllInstitutionsController', {
            AuthService,
            InstitutionService
        });
    }));


    describe('Test getInstitutions()', function() {

        it('Should return all institutions', function() {
            allInstitutionsController.institutions = [institution, other_institution];
            expect(allInstitutionsController.getInstitutions()).toEqual([institution, other_institution]);
            allInstitutionsController.filterKeyword = "*";
            expect(allInstitutionsController.getInstitutions()).toEqual([institution, other_institution]);
        });

        it('Should return institution found', function() {
            allInstitutionsController.institutions = [institution, other_institution];
            allInstitutionsController.filterKeyword = "institution";
            expect(allInstitutionsController.getInstitutions()).toEqual([institution]);
            allInstitutionsController.filterKeyword = "other_inst";
            expect(allInstitutionsController.getInstitutions()).toEqual([other_institution]);
        });

        fit('Shuld return empty list', function() {
            allInstitutionsController.institutions = [institution, other_institution];
            allInstitutionsController.filterKeyword = "institution_inst";
            expect(allInstitutionsController.getInstitutions()).toEqual([]);
        });
    });
}));