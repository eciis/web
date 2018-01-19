'use strict';

(describe('Test SearchController', function() {

    var httpBackend, scope, createCtrl, state, instService, searchCtrl;

    var user = {
        name: 'username',
        key: 'user-key',
        state: 'active'
    };

    var splab = {
        name: 'Splab',
        key: '1239',
        federal_state: 'Paraíba',
        actuation_area: 'REGULATORY_AGENCY',
        legal_nature: 'PRIVATE_FOR-PROFIT'
    };

    var inst = {
        name: 'Testing inst',
        federal_state: 'Bahia',
        actuation_area: 'REGULATORY_AGENCY',
        legal_nature: 'PRIVATE_NON-PROFIT'
    };
    
    var instToTest = {
        name: 'Inst to test',
        federal_state: 'Paraíba',
        actuation_area: 'FUNDING_AGENCY',
        legal_nature: 'PUBLIC'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, AuthService, InstitutionService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        instService = InstitutionService;

        AuthService.login(user);
        httpBackend.expectGET('app/institution/actuation_area.json').respond({
            "FUNDING_AGENCY": "Agência de Fomento",
            "REGULATORY_AGENCY": "Agência Reguladora"}
        );
        httpBackend.expectGET('app/institution/legal_nature.json').respond({
            "PRIVATE_FOR-PROFIT": "Privada com fins lucrativos",
            "PRIVATE_NON-PROFIT": "Privada sem fins lucrativos",
            "PUBLIC": "Pública"
        });
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "error/user_inactive.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', "auth/login.html").respond(200);
        createCtrl = function() {
            return $controller('SearchController', {
                scope: scope,
                state: state,
                search_keyword: ""
            });
        };
        searchCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('SearchController functions', function() {

        describe('goToInstitution()', function() {

            beforeEach(function() {
                spyOn(instService, 'getInstitution').and.callThrough();
                spyOn(state, 'go').and.callThrough();
                httpBackend.expect('GET', "/api/institutions/" + splab.key).respond(splab);
                searchCtrl.goToInstitution(splab.key);
                httpBackend.flush();
            });

            it('Should call InstitutionService.getInstitution', function() {
                expect(instService.getInstitution).toHaveBeenCalledWith(splab.key);
            });

            it('Should call state.go', function() {
                expect(state.go).toHaveBeenCalled();
            });
        });

        describe('notHasInstitution', function() {

            it('Should be true when institutions list is empty', function() {
                expect(searchCtrl.notHasInstitutions()).toBeTruthy();
            });

            it('Should be false when instituions list contains some institution', function() {
                searchCtrl.institutions.push(splab);
                expect(searchCtrl.notHasInstitutions()).toBeFalsy();
            });
        });

        describe('search()', function() {

            it('Should call makeSearch()', function() {
                spyOn(searchCtrl, 'makeSearch');
                searchCtrl.search_keyword = 'splab';
                searchCtrl.search();
                expect(searchCtrl.makeSearch).toHaveBeenCalled();
            });
        });

        describe('makeSearch()', function() {

            it('Should call InstitutionService.searchInstitutions', function(done) {
                searchCtrl.search_keyword = 'splab';
                spyOn(instService, 'searchInstitutions').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback({});
                        }
                    };
                });
                searchCtrl.makeSearch(searchCtrl.search_keyword, 'institution').then(function() {
                    expect(instService.searchInstitutions).toHaveBeenCalledWith('splab', 'active', 'institution');
                    done();
                });
            });
        });

        describe('searchBy()', function() {
            beforeEach(function () {
                spyOn(searchCtrl, 'makeSearch').and.callThrough();
                spyOn(instService, 'searchInstitutions').and.callFake(function () {
                    return {
                        then: function (callback) {
                            return callback(
                                {data: [splab, inst, instToTest]}
                            );
                        }
                    };
                });
                searchCtrl.makeSearch("", 'institution');
                searchCtrl.search_keyword = "random";
                searchCtrl.previous_keyword = searchCtrl.search_keyword;
            });

            it('Should call makeSearch()', function() {
                searchCtrl.searchBy('Universidades');
                expect(searchCtrl.makeSearch).toHaveBeenCalled();
            });

            it('Should filter the institutions by actuation_area', function () {
                searchCtrl.searchBy('REGULATORY_AGENCY', 'actuation_area');
                expect(searchCtrl.institutions).toEqual([splab, inst]);

                searchCtrl.searchBy('FUNDING_AGENCY', 'actuation_area');
                expect(searchCtrl.institutions).toEqual([instToTest]);

                searchCtrl.searchBy('PRIVATE_COMPANY', 'actuation_area');
                expect(searchCtrl.institutions).toEqual([]);
            });

            it('Should filter the institutions by legal_nature', function () {
                searchCtrl.searchBy('PRIVATE_FOR-PROFIT', 'legal_nature');
                expect(searchCtrl.institutions).toEqual([splab]);

                searchCtrl.searchBy('PRIVATE_NON-PROFIT', 'legal_nature');
                expect(searchCtrl.institutions).toEqual([inst]);

                searchCtrl.searchBy('PUBLIC', 'legal_nature');
                expect(searchCtrl.institutions).toEqual([instToTest]);
            });

            it('Should filter the institutions by federal_state', function () {
                searchCtrl.searchBy('Paraíba', 'federal_state');
                expect(searchCtrl.institutions).toEqual([splab, instToTest]);

                searchCtrl.searchBy('Bahia', 'federal_state');
                expect(searchCtrl.institutions).toEqual([inst]);

                searchCtrl.searchBy('Pernambuco', 'federal_state');
                expect(searchCtrl.institutions).toEqual([]);
            });

            it('Should filter the institutions by actuation_area and legal_nature', function () {
                searchCtrl.searchNature = "Privada com fins lucrativos"
                searchCtrl.searchBy('REGULATORY_AGENCY', 'actuation_area');
                expect(searchCtrl.institutions).toEqual([splab]);

                searchCtrl.searchActuation = "Agência de Fomento"
                searchCtrl.searchBy('PUBLIC', 'legal_nature');
                expect(searchCtrl.institutions).toEqual([instToTest]);

                searchCtrl.searchNature = "Privada sem fins lucrativos"
                searchCtrl.searchBy('REGULATORY_AGENCY', 'actuation_area');
                expect(searchCtrl.institutions).toEqual([inst]);
            });

            it('Should filter the institutions by actuation_area, legal_nature and federal_state', function () {
                searchCtrl.searchNature = "Privada com fins lucrativos"
                searchCtrl.searchState = {nome: "Alagoas"}
                searchCtrl.searchBy('REGULATORY_AGENCY', 'actuation_area');
                expect(searchCtrl.institutions).toEqual([]);

                searchCtrl.searchActuation = "Agência de Fomento"
                searchCtrl.searchState = { nome: "Paraíba" }
                searchCtrl.searchBy('PUBLIC', 'legal_nature');
                expect(searchCtrl.institutions).toEqual([instToTest]);

                searchCtrl.searchNature = "Privada sem fins lucrativos"
                searchCtrl.searchState = { nome: "Bahia" }
                searchCtrl.searchBy('REGULATORY_AGENCY', 'actuation_area');
                expect(searchCtrl.institutions).toEqual([inst]);
            });
        });

        describe('isLoading()', function() {
            it('Should be false if search_keyword is empty', function() {
                searchCtrl.search_keyword = "";
                expect(searchCtrl.isLoading()).toBeFalsy();
            });

            it('Should be true if search_keyword is not empty', function() {
                searchCtrl.search_keyword = "splab";
                expect(searchCtrl.isLoading()).toBeTruthy();
            });
        });
    });
}));