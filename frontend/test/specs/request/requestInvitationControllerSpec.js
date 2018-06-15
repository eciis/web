'use strict';

(describe('Test RequestInvitationController', function() {

    var requestInvCtrl, httpBackend, scope, institutionService, createCtrl, state, requestService;

    var SEARCH_INST_URI = "/api/search/institution?";
    var INST_URI = "/api/institutions/";

    var splab = {
        name: 'SPLAB',
        key: '987654321',
        id: '987654321',
        photo_url: "photo_url"
    };

    var certbio = {
        name: 'CERTBIO',
        key: '123456789',
        id: '123456789',
        photo_url: "photo_url"
    };

    var user = {
        name: 'User',
        key: '12107',
        email: 'user@ccc.ufcg.edu.br',
        state: 'active'
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $q, $state, InstitutionService, AuthService, RequestInvitationService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        institutionService = InstitutionService;
        requestService = RequestInvitationService;

        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);

        AuthService.login(user);

        createCtrl = function() {
            return $controller('RequestInvitationController',
                {
                    scope: scope,
                    institutionService: institutionService
                });
        };
        requestInvCtrl = createCtrl();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('RequestInvitationController functions', function() {

        describe('verifyAndSendRequest()', function() {
            beforeEach(function() {
                requestInvCtrl.requestsOfSelectedInst = [{sender_key: user.key, status: 'sent'}];
                requestInvCtrl.institutionSelect = {key: certbio.key, admin: {key: '12345'}};
                requestInvCtrl.request = {name: 'User'};
            });

            it('Should be call filter', function() {
                spyOn(requestInvCtrl.requestsOfSelectedInst, 'filter').and.callThrough();
                requestInvCtrl.verifyAndSendRequest();
                expect(requestInvCtrl.requestsOfSelectedInst.filter).toHaveBeenCalled();
            });

            it('Should be call sendRequest', function() {
                requestInvCtrl.requestsOfSelectedInst = [];                
                spyOn(requestInvCtrl, 'sendRequest');
                requestInvCtrl.verifyAndSendRequest();
                expect(requestInvCtrl.sendRequest).toHaveBeenCalled();
            });
        });
    });
}));