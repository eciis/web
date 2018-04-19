'use strict';

(describe('Test RequestProcessingController', function() {
    var INSTITUTIONS_URI = "/api/institutions";
    var INST_KEY = "inst-key";
    var REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
    var REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";
    var REQUEST_INSTITUTION = "REQUEST_INSTITUTION";
    var REQUEST_USER = "REQUEST_USER";

    var requestInvitationService, institutionService, requestCtrl, scope, httpBackend, deferred, createCtrl;

    var request = {
        key: 'request-key',
        type_of_invite: null,
        institution_requested_key: INST_KEY,
        institution_key: INST_KEY,
        type_of_invite: REQUEST_USER,
        status: 'sent'
    };

    var user = {
        key: 'user-key',
        state: 'active'
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

    function callFake() {
        return {
            then: function(calback) {
                calback();
            }
        };
    }

    beforeEach(module('app'));
    beforeEach(inject(function($controller, $rootScope, $httpBackend, AuthService, RequestInvitationService, InstitutionService, $q) {
        requestInvitationService = RequestInvitationService;
        institutionService = InstitutionService;
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        deferred = $q.defer();
        AuthService.login(user);
        httpBackend.when('GET', INSTITUTIONS_URI + "/" + INST_KEY).respond(institution);

        createCtrl = function() {
            return $controller('RequestProcessingController', {
                scope: scope,
                requestInvitationService: requestInvitationService,
                institutionService: institutionService,
                request: request
            });
        }

        requestCtrl = createCtrl();
    }));

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    fdescribe('acceptRequest()', function() {
      
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

        it('Should accept children institution request', function() {
            request.type_of_invite = REQUEST_CHILDREN;
            spyOn(requestInvitationService, 'acceptInstChildrenRequest').and.callFake(callFake);
            requestCtrl.acceptRequest();
            expect(requestInvitationService.acceptInstChildrenRequest).toHaveBeenCalledWith(request.key);
        });

        it('Should accept parent institution request', function() {
            request.type_of_invite = REQUEST_PARENT;
            spyOn(requestInvitationService, 'acceptInstParentRequest').and.callFake(callFake);
            requestCtrl.acceptRequest();
            expect(requestInvitationService.acceptInstParentRequest).toHaveBeenCalledWith(request.key);
        });
    });

    describe('rejectRequest()', function() {

        beforeEach(function() {
            spyOn(requestInvitationService, 'showRejectDialog').and.returnValue(deferred.promise);
            deferred.resolve();
        });

        it('Should reject user request', function() {
            request.type_of_invite = REQUEST_USER;
            spyOn(requestInvitationService, 'rejectRequest').and.callFake(callFake);
            requestCtrl.rejectRequest();
            scope.$apply();
            expect(requestInvitationService.showRejectDialog).toHaveBeenCalled();
            expect(requestInvitationService.rejectRequest).toHaveBeenCalledWith(request.key);
        });

        it('Should reject institution request', function() {
            request.type_of_invite = REQUEST_INSTITUTION;
            spyOn(requestInvitationService, 'rejectRequestInst').and.callFake(callFake);
            requestCtrl.rejectRequest();
            scope.$apply();
            expect(requestInvitationService.rejectRequestInst).toHaveBeenCalledWith(request.key);
        });

        it('Should reject children institution request', function() {
            request.type_of_invite = REQUEST_CHILDREN;
            spyOn(requestInvitationService, 'rejectInstChildrenRequest').and.callFake(callFake);
            requestCtrl.rejectRequest();
            scope.$apply();
            expect(requestInvitationService.rejectInstChildrenRequest).toHaveBeenCalledWith(request.key);
        });

        it('Should reject parent institution request', function() {
            request.type_of_invite = REQUEST_PARENT;
            spyOn(requestInvitationService, 'rejectInstParentRequest').and.callFake(callFake);
            requestCtrl.rejectRequest();
            scope.$apply();
            expect(requestInvitationService.rejectInstParentRequest).toHaveBeenCalledWith(request.key);
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

}));