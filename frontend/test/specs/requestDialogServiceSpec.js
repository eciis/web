"use strict";

(describe("Test RequestDialogService", function () {

    const REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
    const REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";
    const REQUEST_INSTITUTION = "REQUEST_INSTITUTION";
    const REQUEST_USER = "REQUEST_USER";
    const USER_ADM = 'USER_ADM';
    const ACCEPT_INVITE_USER_ADM = 'ACCEPT_INVITE_USER_ADM';
    const REQUEST_URI = "/api/requests/";
    const INVITES_URI = "/api/invites/";

    var requestInvitationService, inviteService, mdDialog,
    service, request, event, notification, dialogProperties,
    httpBackend;

    beforeEach(module('app'));

    beforeEach(inject(function (RequestInvitationService, InviteService, $mdDialog,
        MessageService, RequestDialogService, $httpBackend) {
        
        service = RequestDialogService;
        requestInvitationService = RequestInvitationService;
        inviteService = InviteService;
        mdDialog = $mdDialog;
        messageService = MessageService;
        httpBackend = $httpBackend;
        event = {};

        dialogProperties = {
            locals: {}
        };

        request = new Invite({
            status: 'sent',
            type_of_invite: '',
            key: 'request-key'
        });

        notification = {
            entity_type: '',
            entity: request,
        };
    }));

    describe('Test showHierarchyDialog', function () {

        it('should show a dialog with the expected properties', function () {
            var promiseData = Promise.resolve({});
            spyOn(mdDialog, 'show').and.returnValue(Promise.resolve(promiseData));
            
            var promise = service.showHierarchyDialog(request, event);
            var dialogData = {
                controller: 'AnalyseHierarchyRequestController',
                controllerAs: 'analyseHierReqCtrl',
                templateUrl: 'app/requests/analyse_hierarchy_request_dialog.html',
                targetEvent: event,
                locals: { 
                    request: request
                }
            };
            
            expect(mdDialog.show).toHaveBeenCalledWith(dialogData);
            expect(promise).toEqual(promiseData);
        });
    });

    describe("Test showRequestDialog", function () {
        const setNotificationType = (type) => notification.entity_type = type;
        
        describe("Test getRequest", function () {

            it("should call RequestInvitationService getRequest", function () {
                spyOn(requestInvitationService, 'getRequest').and.returnValue(Promise.resolve({}));
                setNotificationType(REQUEST_USER);
                service.showRequestDialog(notification, event, dialogProperties);
                expect(requestInvitationService.getRequest).toHaveBeenCalledWith(request.key);
            });

            it("should call RequestInvitationService getRequestInst", function () {
                spyOn(requestInvitationService, 'getRequestInst').and.returnValue(Promise.resolve({}));
                setNotificationType(REQUEST_INSTITUTION);
                service.showRequestDialog(notification, event, dialogProperties);
                expect(requestInvitationService.getRequestInst).toHaveBeenCalledWith(request.key);
            });

            it("should call RequestInvitationService getInstChildrenRequest", function () {
                spyOn(requestInvitationService, 'getInstChildrenRequest').and.returnValue(Promise.resolve({}));
                setNotificationType(REQUEST_CHILDREN);
                service.showRequestDialog(notification, event, dialogProperties);
                expect(requestInvitationService.getInstChildrenRequest).toHaveBeenCalledWith(request.key);
            });

            it("should call RequestInvitationService getInstParentRequest", function () {
                spyOn(requestInvitationService, 'getInstParentRequest').and.returnValue(Promise.resolve({}));
                setNotificationType(REQUEST_PARENT);
                service.showRequestDialog(notification, event, dialogProperties);
                expect(requestInvitationService.getInstParentRequest).toHaveBeenCalledWith(request.key);
            });

            it("should call InviteService getInvite", function () {
                spyOn(inviteService, 'getInvite').and.returnValue(Promise.resolve({}));
                
                setNotificationType(USER_ADM);
                service.showRequestDialog(notification, event, dialogProperties);
                expect(inviteService.getInvite).toHaveBeenCalledWith(request.key);

                setNotificationType(ACCEPT_INVITE_USER_ADM);
                service.showRequestDialog(notification, event, dialogProperties);
                expect(inviteService.getInvite).toHaveBeenCalledWith(request.key);
            });
        });

        describe("Test selectDialog", function () {
            
            describe("Test select resolved request dialog", function () {

                beforeEach(function () {
                    spyOn(service, 'showResolvedReqDialog');       
                    request.setType(REQUEST_USER);
                    setNotificationType(REQUEST_USER);
                    httpBackend.when('GET', REQUEST_URI + request.key + "/user").respond(request);
                });
                
                it("should show the dialog for rejected request", function () {
                    request.setStatus('rejected');
                    service.showRequestDialog(notification, event, dialogProperties);
                    httpBackend.flush();
                    expect(service.showResolvedReqDialog).toHaveBeenCalled();
                });

                it("should show the dialog for accepted request", function () {
                    request.setStatus('accepted');
                    service.showRequestDialog(notification, event, dialogProperties);
                    httpBackend.flush();
                    expect(service.showResolvedReqDialog).toHaveBeenCalled();
                });
            });
            
            describe("Test select showHierarchyDialog", function () {

                beforeEach(function () {
                    spyOn(service, 'showHierarchyDialog');
                });
                
                it("should show dialog on request child", function () {
                    request.setType(REQUEST_CHILDREN);
                    setNotificationType(REQUEST_CHILDREN);
                    httpBackend.when('GET', REQUEST_URI + request.key + "/institution_children").respond(request);
                    service.showRequestDialog(notification, event, dialogProperties);
                    httpBackend.flush();
                    request = new Invite(request);
                    expect(service.showHierarchyDialog).toHaveBeenCalledWith(request, event);
                });

                it("should show dialog on request parent", function () {
                    request.setType(REQUEST_PARENT);
                    setNotificationType(REQUEST_PARENT);
                    httpBackend.when('GET', REQUEST_URI + request.key + "/institution_parent").respond(request);
                    service.showRequestDialog(notification, event, dialogProperties);
                    httpBackend.flush();
                    request = new Invite(request);
                    expect(service.showHierarchyDialog).toHaveBeenCalledWith(request, event);
                });
            });

            describe("Test select pending request dialog", function () {

                beforeEach(function () {
                    spyOn(service, 'showPendingReqDialog');
                });

                afterEach(function () {
                    service.showRequestDialog(notification, event, dialogProperties);
                    httpBackend.flush();
                    expect(service.showPendingReqDialog).toHaveBeenCalledWith(dialogProperties, event);
                })

                it('should show the dialog for request institution', function () {
                    request.setType(REQUEST_INSTITUTION);
                    setNotificationType(REQUEST_INSTITUTION);
                    httpBackend.when('GET', REQUEST_URI + request.key + "/institution").respond(request);
                });

                it('should show the dialog for request user', function () {
                    request.setType(REQUEST_USER);
                    setNotificationType(REQUEST_USER);
                    httpBackend.when('GET', REQUEST_URI + request.key + "/user").respond(request);
                });

                it('should show the dialog for request user admin', function () {
                    request.setType(USER_ADM);
                    setNotificationType(USER_ADM);
                    httpBackend.when('GET', INVITES_URI + request.key).respond(request);
                });

                it('should show the dialog for accept invite user admin', function () {
                    request.setType(ACCEPT_INVITE_USER_ADM);
                    setNotificationType(ACCEPT_INVITE_USER_ADM);
                    httpBackend.when('GET', INVITES_URI + request.key).respond(request);
                });
            });
        });
    });
}));