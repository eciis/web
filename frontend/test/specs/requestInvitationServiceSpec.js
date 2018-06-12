'use strict';

(describe('Test RequestInvitationService', function () {
    const INST_REQUEST_URI = "/api/institutions/";
    const REQUEST_URI = "/api/requests/";
    
    var service, mdDialog, q, messageService, httpService, institutionTest, requestTest, inviteTest, promiseData;

    var instData = {
        name: 'Test',
        key: '12345',
    };

    var requestData = {
        type_of_invite: 'REQUEST'
    };

    var inviteData = {
        type_of_invite: 'INVITE'
    };

    beforeEach(module('app'));

    beforeEach(inject(function (RequestInvitationService, $mdDialog, $q, MessageService, HttpService) {
        service = RequestInvitationService;
        httpService = HttpService;
        mdDialog = $mdDialog;
        q = $q;
        messageService = MessageService;
    }));

    describe('Test RequestInvitationService requests', function() {
        var fakeCallback;

        beforeEach(function() {
            promiseData = Promise.resolve({});
            institutionTest = new Institution(instData);
            requestTest = new Invite(requestData);
            inviteTest = new Invite(inviteData);

            fakeCallback = function () {
                return {
                    then: function (callback) {
                        return callback(requestTest);
                    }
                };
            };
        });

        it('sendRequest()', function() {
            spyOn(httpService, 'post').and.returnValue(promiseData);
            service.sendRequest(requestTest, institutionTest.key).then(() => {});
            expect(httpService.post).toHaveBeenCalledWith(INST_REQUEST_URI + institutionTest.key + "/requests/user", {data: requestTest});
        });

        it('sendRequestInst()', function() {
            spyOn(httpService, 'post').and.returnValue(promiseData);
            service.sendRequestInst(requestTest).then(() => {});
            expect(httpService.post).toHaveBeenCalledWith(INST_REQUEST_URI + "requests/institution/", {data: requestTest});
            expect(requestTest.type_of_invite).toEqual("REQUEST_INSTITUTION");
        });

        it('sendRequestToParentInst()', function() {
            spyOn(httpService, 'post').and.returnValue(promiseData);
            service.sendRequestToParentInst(inviteTest, institutionTest.key).then(() => {});
            expect(httpService.post).toHaveBeenCalledWith(INST_REQUEST_URI + institutionTest.key + "/requests/institution_parent", inviteTest);
        });

        it('sendRequestToChildrenInst()', function() {
            spyOn(httpService, 'post').and.returnValue(promiseData);
            service.sendRequestToChildrenInst(inviteTest, institutionTest.key).then(() => {});
            expect(httpService.post).toHaveBeenCalledWith(INST_REQUEST_URI + institutionTest.key + "/requests/institution_children", inviteTest)
        });

        it('getParentRequests()', function() {
            spyOn(httpService, 'get').and.callFake(fakeCallback);
            var result;
            service.getParentRequests(institutionTest.key).then((data) => {
                result = [data];
            });
            expect(httpService.get).toHaveBeenCalledWith(INST_REQUEST_URI + institutionTest.key + "/requests/institution_parent");
            expect(result).toEqual([requestTest]);
        });

        it('getChildrenRequests()', function() {
            spyOn(httpService, 'get').and.callFake(fakeCallback);
            var result;
            service.getChildrenRequests(institutionTest.key).then((data) => {
                result = [data];
            });
            expect(httpService.get).toHaveBeenCalledWith(INST_REQUEST_URI + institutionTest.key + "/requests/institution_children");
            expect(result).toEqual([requestTest]);
        });

        it('getRequests()', function() {
            spyOn(httpService, 'get').and.callFake(fakeCallback);
            var result;
            service.getRequests(institutionTest.key).then((data) => {
                result = [data];
            });
            expect(httpService.get).toHaveBeenCalledWith(INST_REQUEST_URI + institutionTest.key + "/requests/user");
            expect(result).toEqual([requestTest]);
        });

        it('getRequestsInst()', function() {
            spyOn(httpService, 'get').and.callFake(fakeCallback);
            var result;
            service.getRequestsInst(institutionTest.key).then((data) => {
                result = [data];
            });
            expect(httpService.get).toHaveBeenCalledWith(INST_REQUEST_URI + "requests/institution/" + institutionTest.key);
            expect(result).toEqual([requestTest]);
        });

        it('getRequestInst()', function() {
            spyOn(httpService, 'get').and.callFake(fakeCallback);
            var result;
            service.getRequestInst(requestTest.key).then((data) => {
                result = data;
            });
            expect(httpService.get).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/institution");
            expect(result).toEqual(requestTest);
        });

        it('getRequest()', function() {
            spyOn(httpService, 'get').and.callFake(fakeCallback);
            var result;
            service.getRequest(requestTest.key).then((data) => {
                result = data;
            });
            expect(httpService.get).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/user");
            expect(result).toEqual(requestTest);
        });

        it('acceptRequest()', function() {
            spyOn(httpService, 'put').and.returnValue(promiseData);
            service.acceptRequest(requestTest.key).then(() => {});
            expect(httpService.put).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/user");
        });

        it('rejectRequest()', function() {
            spyOn(httpService, 'delete').and.returnValue(promiseData);
            service.rejectRequest(requestTest.key).then(() => {});
            expect(httpService.delete).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/user");
        });

        it('acceptRequestInst()', function() {
            spyOn(httpService, 'put').and.returnValue(promiseData);
            service.acceptRequestInst(requestTest.key).then(() => {});
            expect(httpService.put).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/institution");
        });

        it('rejectRequestInst()', function() {
            spyOn(httpService, 'delete').and.returnValue(promiseData);
            service.rejectRequestInst(requestTest.key).then(() => {});
            expect(httpService.delete).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/institution");
        });

        it('getInstParentRequest()', function() {
            spyOn(httpService, 'get').and.callFake(fakeCallback);
            var result;
            service.getInstParentRequest(requestTest.key).then((data) => {
                result = data;
            });
            expect(httpService.get).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/institution_parent");
            expect(result).toEqual(requestTest);
        });

        it('acceptInstParentRequest()', function() {
            spyOn(httpService, 'put').and.returnValue(promiseData);
            service.acceptInstParentRequest(requestTest.key).then(() => {});
            expect(httpService.put).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/institution_parent");
        });

        it('rejectInstParentRequest()', function() {
            spyOn(httpService, 'delete').and.returnValue(promiseData);
            service.rejectInstParentRequest(requestTest.key).then(() => {});
            expect(httpService.delete).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/institution_parent");
        });

        it('getInstChildrenRequest()', function() {
            spyOn(httpService, 'get').and.callFake(fakeCallback);
            var result;
            service.getInstChildrenRequest(requestTest.key).then((data) => {
                result = data;
            });
            expect(httpService.get).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/institution_children");
            expect(result).toEqual(requestTest);
        });

        it('acceptInstChildrenRequest()', function() {
            spyOn(httpService, 'put').and.returnValue(promiseData);
            service.acceptInstChildrenRequest(requestTest.key).then(() => {});
            expect(httpService.put).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/institution_children");
        });

        it('rejectInstChildrenRequest()', function() {
            spyOn(httpService, 'delete').and.returnValue(promiseData);
            service.rejectInstChildrenRequest(requestTest.key).then(() => {});
            expect(httpService.delete).toHaveBeenCalledWith(REQUEST_URI + requestTest.key + "/institution_children");
        });
    });
}));