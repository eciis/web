'use strict';

(describe('Test RequestProcessingController', function() {
    var INSTITUTIONS_URI = "/api/institutions";
    var USER_URI = "/api/user";
    var INST_KEY = "inst-key";
    var REQUEST_INSTITUTION = "REQUEST_INSTITUTION";
    var REQUEST_USER = "REQUEST_USER";

    var legal_nature = {
        "private for-profit":"Privada com fins lucrativos",
        "private non-profit":"Privada sem fins lucrativos",
        "public":"Pública"
    };
    var area = {
        "OFFICIAL_BANK": "Banco Oficial",
        "COMMISSION": "Comissão",
        "COUNCIL": "Conselho",
        "PRIVATE_COMPANY": "Empresa Privada",
    };

    var requestInvitationService, institutionService, requestCtrl, scope, httpBackend;
    var authService, userService, messageService, request;

    var newRequest = {
        key: 'request-key',
        type_of_invite: null,
        institution_requested_key: INST_KEY,
        institution_key: INST_KEY,
        type_of_invite: REQUEST_USER,
        status: 'sent'
    };

    var user = {
        key: 'user-key',
        state: 'active',
        permissions: []
    };

    var institution = {
        address: {
            street: "Test",
            number: 0,
            neighbourhood: 'Test',
            city: 'Test',
            state: 'Test',
            country: 'Test'
        },
        key: INST_KEY
    };

    var permissions = [
        {'update_inst': {
            'inst-key': true
            }
        }
    ];

    function callFake() {
        return {
            then: function(calback) {
                calback();
            }
        };
    }

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $rootScope, $httpBackend, AuthService,
         RequestInvitationService, InstitutionService, UserService, MessageService) {
        
        requestInvitationService = RequestInvitationService;
        institutionService = InstitutionService;
        userService = UserService;
        messageService = MessageService;
        httpBackend = $httpBackend;
        authService = AuthService;
        scope = $rootScope.$new();
        AuthService.login(user);
        request = Object.assign({}, newRequest);

        httpBackend.when('GET', 'app/institution/actuation_area.json').respond(area);
        httpBackend.when('GET', 'app/institution/legal_nature.json').respond(legal_nature);
        httpBackend.when('GET', INSTITUTIONS_URI + "/" + INST_KEY).respond(institution);
        httpBackend.when('GET', USER_URI).respond(permissions);
        
        requestCtrl = $controller('RequestProcessingController', {
            scope: scope,
            RequestInvitationService: requestInvitationService,
            InstitutionService: institutionService,
            AuthService: authService,
            UserService: UserService,
            MessageService: messageService,
            request: request
        });

        httpBackend.flush();
    }));

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    describe('acceptRequest()', function() {

        beforeEach(function() {
            expect(request.status).toEqual('sent');
        })

        afterEach(function() {
            expect(request.status).toEqual('accepted');
        })

        it('Should accept user request', function() {
            request.type_of_invite = REQUEST_USER;
            spyOn(requestInvitationService, 'acceptRequest').and.callFake(callFake);
            requestCtrl.acceptRequest();
            expect(requestInvitationService.acceptRequest).toHaveBeenCalledWith(request.key);
        });

        it('Should accept institution request', function() {
            request.type_of_invite = REQUEST_INSTITUTION;
            spyOn(requestInvitationService, 'acceptRequestInst').and.callFake(callFake);
            requestCtrl.acceptRequest();
            expect(requestInvitationService.acceptRequestInst).toHaveBeenCalledWith(request.key);
        });
    });

    describe('Test loadUser on acceptRequest()', function() {
        beforeEach(function() {
            spyOn(userService, 'load').and.callFake(function() {
                return {
                    then: function(callback) {
                        callback({permissions: permissions});
                    }
                };
            }); 

            spyOn(requestInvitationService, 'acceptRequest').and.callFake(function(){
                return {
                    then: function(callback) {
                        callback();
                    }
                };
            });

            spyOn(requestInvitationService, 'getRequest').and.callFake(callFake);
            spyOn(messageService, 'showInfoToast').and.callFake(callFake);  
            spyOn(requestCtrl, 'hideDialog').and.callFake(function() {});
        });

        it('Should accept request and refresh user permissions', function() {
            expect(authService.getCurrentUser().permissions).toEqual([]);
            expect(request.status).toEqual('sent');

            requestCtrl.acceptRequest();

            expect(authService.getCurrentUser().permissions).toEqual(permissions);
            expect(messageService.showInfoToast).toHaveBeenCalledWith("Solicitação aceita!");
            expect(request.status).toEqual('accepted');
        });
    });

    describe('rejectRequest()', function() {

        it('should set isRejecting to true', function() {
            expect(requestCtrl.isRejecting).toBe(false);
            requestCtrl.rejectRequest();
            expect(requestCtrl.isRejecting).toBe(true);
        });
    });

    describe('confirmReject()', function() {
        
        beforeEach(function() {
            expect(request.status).toEqual('sent');
        })

        afterEach(function() {
            expect(request.status).toEqual('rejected');
        })

        it('Should reject user request', function() {
            request.type_of_invite = REQUEST_USER;
            spyOn(requestInvitationService, 'rejectRequest').and.callFake(callFake);
            requestCtrl.confirmReject();
            scope.$apply();
            expect(requestInvitationService.rejectRequest).toHaveBeenCalledWith(request.key);
        });

        it('Should reject institution request', function() {
            request.type_of_invite = REQUEST_INSTITUTION;
            spyOn(requestInvitationService, 'rejectRequestInst').and.callFake(callFake);
            requestCtrl.confirmReject();
            scope.$apply();
            expect(requestInvitationService.rejectRequestInst).toHaveBeenCalledWith(request.key);
        });
    });

    describe('getFullAddress()', function() {
        
        it('Should getFullAddress', function() {
            var instTest = new Institution(institution);
            var addressInstTest = instTest.getFullAddress();
            var address = requestCtrl.getFullAddress(institution);
            expect(address).toEqual(addressInstTest);
        });
    });

    describe('getSizeGtSmDialog()', function() {
        
        it('should be 45', function() {
            requestCtrl.isRejecting = false;
            expect(requestCtrl.getSizeGtSmDialog()).toEqual('45');
        });

        it('should be 25', function() {
            request.status = 'resolved';
            expect(requestCtrl.getSizeGtSmDialog()).toEqual('25');
        });
    });

    describe('isAnotherCountry()', function() {

        beforeEach(function() {
            requestCtrl.parent = {
                address: {
                    country: "OtherCountry"
                }
            };
        });
        
        it('should return true', function() {
            expect(requestCtrl.isAnotherCountry()).toBeTruthy();
        });
        
        it('should return false', function() {
            requestCtrl.parent.address.country = 'Brasil';
            expect(requestCtrl.isAnotherCountry()).toBeFalsy();
        });
    });

    describe('confirmLinkRemoval', function() {
        it('should delete parent_institution', function() {
            spyOn(institutionService, 'removeLink').and.callFake(function () {
                return {
                    then: function (callback) {
                        callback();
                    }
                };
            });
            spyOn(messageService, 'showInfoToast');
            requestCtrl.children.parent_institution = {key: 'poaskdoad-OPAKSDOAP'};
            requestCtrl.confirmLinkRemoval();

            expect(messageService.showInfoToast).toHaveBeenCalled();
            expect(requestCtrl.children.parent_institution).toEqual(undefined);
        });
    });
}));