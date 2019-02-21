'use strict';

(describe('Test SearchController', function() {

    let httpBackend, scope, createCtrl, state, instService, searchCtrl, mdDialog, window;

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

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, AuthService, 
        InstitutionService, $mdDialog, $window) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        instService = InstitutionService;
        mdDialog = $mdDialog;
        window = $window;

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
        httpBackend.when('GET', "/app/search/search_dialog.html").respond(200);
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

            it('Should call state.go', function() {
                spyOn(state, 'go').and.callThrough();
                searchCtrl.goToInstitution(splab.key);
                expect(state.go).toHaveBeenCalled();
            });
        });

        describe('search()', function() {

            it('Should call makeSearch(); mobile screen', function() {
                spyOn(searchCtrl, 'makeSearch').and.callFake(function () {
                    return {
                        then: function (callback) {
                            return callback();
                        }
                    };
                });
                spyOn(searchCtrl, 'showSearchFromMobile').and.callThrough();
                spyOn(mdDialog, 'show');

                searchCtrl.search_keyword = 'splab';
                searchCtrl.search();

                expect(searchCtrl.makeSearch).toHaveBeenCalled();
                expect(searchCtrl.showSearchFromMobile).toHaveBeenCalled();
                expect(mdDialog.show).toHaveBeenCalled();
            });

            it('should call makeSearch(); not mobile screen', () => {
                spyOn(searchCtrl, 'makeSearch').and.callFake(function () {
                    return {
                        then: function (callback) {
                            return callback();
                        }
                    };
                });
                spyOn(searchCtrl, 'showSearchFromMobile').and.callThrough();
                spyOn(mdDialog, 'show');
                spyOn(Utils, 'isMobileScreen').and.returnValue(false);

                searchCtrl.search_keyword = 'splab';
                searchCtrl.search();

                expect(searchCtrl.makeSearch).toHaveBeenCalled();
                expect(searchCtrl.showSearchFromMobile).not.toHaveBeenCalled();
                expect(mdDialog.show).not.toHaveBeenCalled();
            })
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
                expect(searchCtrl.hasChanges).toEqual(false);
                searchCtrl.makeSearch(searchCtrl.search_keyword, 'institution').then(function() {
                    expect(instService.searchInstitutions).toHaveBeenCalledWith('splab', 'active', 'institution');
                    expect(searchCtrl.hasChanges).toEqual(true);
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
                                [splab, inst, instToTest]
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

        describe('showSearchFromMobile', () => {
            it('should call mdDialog.show', () => {
                spyOn(mdDialog, 'show');
                searchCtrl.showSearchFromMobile();
                expect(mdDialog.show).toHaveBeenCalled();
            });
        });

        describe('leaveMobileSearchPage()', () => {
            it('should call window.history.back', () => {
                spyOn(window.history, 'back');
                searchCtrl.leaveMobileSearchPage();
                expect(window.history.back).toHaveBeenCalled();
            });
        });

        describe('isMobileScreen', () => {
            it('should call Utils.isMobileScreen', () => {
                spyOn(Utils, 'isMobileScreen');
                searchCtrl.isMobileScreen();
                expect(Utils.isMobileScreen).toHaveBeenCalled();
            });
        });

        describe('setHasChanges', () => {
            it('should set to true when seach_keyword is defined', () => {
                searchCtrl.search_keyword = 'tst';
                expect(searchCtrl.hasChanges).toEqual(false);
                searchCtrl.setHasChanges();
                expect(searchCtrl.hasChanges).toEqual(true);
            });

            it('should set to false when seach_keyword is not defined', () => {
                searchCtrl.hasChanges = true;
                searchCtrl.setHasChanges();
                expect(searchCtrl.hasChanges).toEqual(false);
            });
        });
    });
}));