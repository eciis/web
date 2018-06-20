'use strict';

(describe('Test RequestInvitationController', function() {

    var requestInvCtrl, httpBackend, scope, institutionService, createCtrl, requestService, mdDialog, messageService, authService;

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

    var fakeCallback = function fakeCallback() {
        return {
            then: function (callback) {
                return callback({});
            }
        };
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $mdDialog,
            InstitutionService, AuthService, RequestInvitationService, MessageService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        institutionService = InstitutionService;
        requestService = RequestInvitationService;
        mdDialog = $mdDialog;
        messageService = MessageService;
        authService = AuthService;

        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        user = new User(user);
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

        describe('sendRequest()', function() {
            var promise;

            beforeEach(function() {
                requestInvCtrl.institutionSelect = {key: certbio.key, admin: {key: '12345'}};
                requestInvCtrl.request = {
                    sender_name: 'User Test',
                    office: 'Test',
                    institutional_email: 'test@example.com'
                };
                requestInvCtrl.currentUser.institutions_requested = [];
                spyOn(requestService, 'sendRequest').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback({});
                        }
                    };
                });
                spyOn(requestInvCtrl.currentUser.institutions_requested, 'push');
                spyOn(mdDialog, 'hide').and.callFake(fakeCallback);
                spyOn(authService, 'save').and.callFake(fakeCallback);
                spyOn(messageService, 'showToast').and.callFake(fakeCallback);
                promise = requestInvCtrl.sendRequest();
            });

            it('Should add a key institution key in user.institutions_requested', function(done) {
                promise.then(function() {
                    expect(requestInvCtrl.currentUser.institutions_requested.push).toHaveBeenCalledWith(certbio.key);
                    done();
                });
            });

            it('Should call mdDialog.hide()', function(done) {
                promise.then(function() {
                    expect(mdDialog.hide).toHaveBeenCalled();
                    done();
                });
            });

            it('Should call AuthService.save()', function(done) {
                promise.then(function() {
                    expect(authService.save).toHaveBeenCalled();
                    done();
                });
            });

            it('Should call MessageService.showToast()', function(done) {
                promise.then(function() {
                    expect(messageService.showToast).toHaveBeenCalledWith("Pedido enviado com sucesso!");
                    done();
                });
            });
        });
    });
}));