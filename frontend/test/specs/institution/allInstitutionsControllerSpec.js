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

    var third_institution = {
        name: 'third_inst'
    };

    var fourth_institution = {
        name: 'fourth_institution'
    };

    var authService, institutionService, allInstitutionsController, scope;

    beforeEach(inject(function(AuthService, InstitutionService, $controller, $rootScope, $httpBackend) {
        authService = AuthService;
        institutionService = InstitutionService;
        scope = $rootScope;

        authService.login(user);
        spyOn(Utils, 'setScrollListener').and.callFake(function() {});

        $httpBackend.expect('GET', '/api/institutions?page=0&limit=10').respond({
            institutions: [
                institution, 
                other_institution
            ], next: true
        });

        allInstitutionsController = $controller('AllInstitutionsController', {
            authService: AuthService,
            institutionService: InstitutionService
        });

        $httpBackend.flush();
    }));


    describe('Test getInstitutions()', function() {

        it('Should return all institutions', function() {
            expect(allInstitutionsController.getInstitutions()).toEqual([institution, other_institution]);
            allInstitutionsController.filterKeyword = "*";
            expect(allInstitutionsController.getInstitutions()).toEqual([institution, other_institution]);
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
        beforeEach(function() {
            spyOn(institutionService, 'getNextInstitutions').and.callFake(function() {
                return {
                    then: function(callback) {
                        callback(
                            {
                                institutions: [
                                    third_institution, 
                                    fourth_institution
                                ],
                                next: false
                            }
                        );
                    }
                };
            });
        });

        it('Should get institutions', function(done) {
            expect(allInstitutionsController.institutions).toEqual([institution, other_institution]);
            var promise = allInstitutionsController.loadMoreInstitutions();
            promise.then(function succsses() {
                expect(allInstitutionsController.institutions).toEqual([institution, other_institution, third_institution, fourth_institution]);
                done();
            });

            scope.$apply();
        });
    });
}));