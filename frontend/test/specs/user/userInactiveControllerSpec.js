'use strict';

(xdescribe('Test UserInactiveController', function() {

    var userInactiveCtrl, httpBackend, scope, institutionService, createCtrl, state, requestService, authService;

    var SEARCH_INST_URI = "/api/search/institution?";
    var INST_URI = "/api/institutions/";

    var institution = {
        name: 'institution',
        key: '987654321',
        id: '987654321',
        photo_url: "photo_url"
    };

    var other_institution = {
        name: 'other institution',
        key: '123456',
        id: '123456',
        photo_url: "photo_url"
    };

    var user = {
        name: 'User',
        key: '12107',
        email: 'user@ccc.ufcg.edu.br',
        state: 'active'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, InstitutionService,
        AuthService, RequestInvitationService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        institutionService = InstitutionService;
        requestService = RequestInvitationService;
        authService = AuthService;

        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);

        AuthService.login(user);

        createCtrl = function() {
            return $controller('UserInactiveController', {
                    scope: scope,
                    institutionService: institutionService
                });
        };
        userInactiveCtrl = createCtrl();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('UserInactiveController functions', function() {

        describe('makeSearch()', function(){
            it('Should return institution', function(done){
                httpBackend.expect('GET', SEARCH_INST_URI + "value=" + institution.name + "&state=active&type=institution").respond([institution]);
                userInactiveCtrl.search = institution.name;
                userInactiveCtrl.finalSearch = institution.name;

                spyOn(institutionService, 'searchInstitutions').and.callThrough();

                userInactiveCtrl.makeSearch().then(function() {
                    expect(institutionService.searchInstitutions).toHaveBeenCalledWith(
                        userInactiveCtrl.finalSearch, 'active', 'institution');
                    expect(userInactiveCtrl.institutions).toEqual([institution]);
                    done();
                });
                httpBackend.flush();
            });

        });

        describe('selectInstitution()', function(){

            it('Should select institution', function(done){
                httpBackend.expect('GET', INST_URI + institution.id).respond(institution);
                spyOn(institutionService, 'getInstitution').and.callThrough();
                spyOn(requestService, 'getRequests').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback([{sender_key: user.key}]);
                        }
                    };
                });
                expect(userInactiveCtrl.institutionSelect).toEqual({});

                userInactiveCtrl.selectInstitution(institution).then(function() {
                    expect(userInactiveCtrl.institutionSelect).toEqual(institution);
                    expect(institutionService.getInstitution).toHaveBeenCalled();
                    expect(requestService.getRequests).toHaveBeenCalled();
                    done();
                });
                httpBackend.flush();
            });
        });

        describe('verifyAndSendRequest()', function() {
            beforeEach(function() {
                userInactiveCtrl.requestsOfSelectedInst = [{sender_key: user.key, status: 'sent'}];
                userInactiveCtrl.institutionSelect = {key: institution.key, admin: {key: '12345'}};
                userInactiveCtrl.request = {name: 'User'};
            });

            it('Should be call filter', function() {
                spyOn(userInactiveCtrl.requestsOfSelectedInst, 'filter').and.callThrough();
                userInactiveCtrl.verifyAndSendRequest();
                expect(userInactiveCtrl.requestsOfSelectedInst.filter).toHaveBeenCalled();
            });

            it('Should be call sendRequest', function() {
                userInactiveCtrl.requestsOfSelectedInst = [];                
                spyOn(userInactiveCtrl, 'sendRequest');
                userInactiveCtrl.verifyAndSendRequest();
                expect(userInactiveCtrl.sendRequest).toHaveBeenCalled();
            });
        });

        describe('showFullInformation()', function(){
            it('Should showFullInformation be true', function(){
                userInactiveCtrl.institutions = [institution];
                userInactiveCtrl.institutionSelect = institution;

                expect(userInactiveCtrl.showFullInformation(institution)).toEqual(true);
            });

            it('Should showFullInformation be false', function(){
                userInactiveCtrl.institutions = [];
                expect(userInactiveCtrl.showFullInformation()).toEqual(false);

                userInactiveCtrl.institutions = [institution, other_institution];
                userInactiveCtrl.institutionSelect = other_institution;
                expect(userInactiveCtrl.showFullInformation(institution)).toEqual(false);
            });
        });

        describe('showMessage()', function(){
            it('Should showMessage be true', function(){
                userInactiveCtrl.institutions = [];
                userInactiveCtrl.wasSearched = true;

                expect(userInactiveCtrl.showMessage()).toEqual(true);
            });

            it('Should showMessage be false', function(){
                userInactiveCtrl.institutions = [];
                userInactiveCtrl.wasSearched = false;
                expect(userInactiveCtrl.showMessage()).toEqual(false);

                userInactiveCtrl.institutions = [institution];
                userInactiveCtrl.wasSearched = true;
                expect(userInactiveCtrl.showMessage()).toEqual(false);
            });
        });

        describe('goToLandingPage()', function() {
            var window;

            beforeEach(inject(function($window) {
                window = $window;
                spyOn(window, 'open').and.callFake(function() {
                    return true;
                });
                spyOn(userInactiveCtrl, 'logout');
            }));

            it('Should call userInactiveCtrl.logout()', function() {
                userInactiveCtrl.goToLandingPage();
                expect(userInactiveCtrl.logout).toHaveBeenCalled();
            });

            it('Should call $window.open()', function() {
                userInactiveCtrl.goToLandingPage();
                expect(window.open).toHaveBeenCalled();
            });
        });

        describe('logout()', function() {
            beforeEach(function() {
                spyOn(authService, 'logout');
            });

            it('Should call AuthService.logout()', function() {
                userInactiveCtrl.logout();
                expect(authService.logout).toHaveBeenCalled();
            });
        });
    });
}));