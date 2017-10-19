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
        key: '1239'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, AuthService, InstitutionService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        instService = InstitutionService;

        AuthService.login(user);

        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "error/user_inactive.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', "auth/login.html").respond(200);
        createCtrl = function() {
            return $controller('SearchController', {
                scope: scope,
            });
        };
        searchCtrl = createCtrl();
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
                searchCtrl.keyWord = 'splab';
                searchCtrl.search();
                expect(searchCtrl.makeSearch).toHaveBeenCalled();
            });
        });

        describe('makeSearch()', function() {

            it('Should call InstitutionService.searchInstitutions', function(done) {
                searchCtrl.finalSearch = 'splab';
                spyOn(instService, 'searchInstitutions').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback({});
                        }
                    };
                });
                searchCtrl.makeSearch().then(function() {
                    expect(instService.searchInstitutions).toHaveBeenCalledWith('splab', 'active');
                    done();
                });
            });
        });
    });
}));