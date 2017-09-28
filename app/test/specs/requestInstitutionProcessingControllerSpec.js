'use strict';

(describe('Test RequestInstitutionProcessingController', function() {
    var requestInvitationService, requestCtrl, scope, httpBackend;

    var request = {
        key: '3478628'
    };

    var user = {
        key: '38972'
    };

    var institution = {
        address: {
            street: "Test",
            number: 0,
            neighbourhood: 'Test',
            city: 'Test',
            state: 'Test',
            country: 'Test'
        }
    };

    function callFake() {
        return {
            then: function(calback) {
                calback();
            }
        };
    }

    beforeEach(module('app'));
    beforeEach(inject(function($controller, $rootScope, $httpBackend, AuthService, RequestInvitationService){
        requestInvitationService = RequestInvitationService;
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        AuthService.login(user);

        requestCtrl = $controller('RequestInstitutionProcessingController', {
            scope: scope,
            requestInvitationService: requestInvitationService,
            key: request.key
        });

      httpBackend.expect('GET', "/api/requests/" + request.key + "/institution").respond(request);
      httpBackend.flush();
    }));

    afterEach(function() {
      httpBackend.verifyNoOutstandingExpectation();
      httpBackend.verifyNoOutstandingRequest();
    });

    describe('acceptRequest()', function() {
        beforeEach(function() {
            spyOn(requestInvitationService, 'acceptRequestInst').and.callFake(callFake);
        });


        it('Should accept request', function() {
            requestCtrl.acceptRequest();
            expect(requestInvitationService.acceptRequestInst).toHaveBeenCalledWith(request.key);
        });
    });

    describe('rejectRequest()', function() {
        beforeEach(function() {
            spyOn(requestInvitationService, 'showRejectDialog').and.callFake(callFake);
            spyOn(requestInvitationService, 'rejectRequestInst').and.callFake(callFake);
        });

        it('Should reject request', function() {
            requestCtrl.rejectRequest();
            expect(requestInvitationService.showRejectDialog).toHaveBeenCalled();
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
}));