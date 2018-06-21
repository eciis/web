'use strict';

(describe("AnalyseHierarchyRequestControllerSpec", function() {

    const REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
    const REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";

    var requestInvitationService, institutionService, messageService, mdDialog,
        analyseHierReqCtrl, scope, createCtrl, request, requestedInstitution, fakeCallback;

    beforeEach(module('app'));

    beforeEach(inject(function(RequestInvitationService, InstitutionService, MessageService, $mdDialog,
        $rootScope, $controller) {

        requestInvitationService = RequestInvitationService;
        institutionService = InstitutionService;
        messageService = MessageService;
        mdDialog = $mdDialog;
        scope = $rootScope.$new();
                
        var instRequesting = new Institution({
            key: 'instRequestingKey',
            name: 'instRequesting',
            parent_institution: null,
            children_institutions: []
        });

        requestedInstitution = new Institution({
            key: 'requestedInstitutionkey',
            name: 'requestedInstitution',
            parent_institution: null,
            children_institutions: []
        });
        
        request = {
            institution: instRequesting,
            requested_institution: requestedInstitution,
            key: 'requestKey',
            status: 'sent'
        };

        createCtrl = function (request) {
            return $controller('AnalyseHierarchyRequestController', {
                scope: scope,
                RequestInvitationService: requestInvitationService,
                InstitutionService: InstitutionService,
                MessageService: MessageService,
                request: request
            });
        }

        fakeCallback = function (param) {
            return {
                then: function (callback) {
                    return callback(param);
                }
            };
        };
    }));

    describe('Analyse request institution parent', function() {

        beforeEach(function () {
            request.type_of_invite = REQUEST_PARENT;
            analyseHierReqCtrl = createCtrl(request);
            spyOn(requestInvitationService, 'acceptInstParentRequest').and.callFake(fakeCallback);
            spyOn(requestInvitationService, 'rejectInstParentRequest').and.callFake(fakeCallback);
            spyOn(messageService, 'showToast');
        });
        
        describe('Test loadInstitutions', function () {
            it('should set parent and child', function() {
                expect(analyseHierReqCtrl.parent).toBe(requestedInstitution);
                expect(analyseHierReqCtrl.child).toBe(request.institution);
                expect(analyseHierReqCtrl.hasToRemoveLink).toBeFalsy();
            });
        });
        
        describe('Test confirmRequest', function () {
            it('should accept the parent request', function () {
                spyOn(mdDialog, 'hide');
                analyseHierReqCtrl.confirmRequest();
                expect(requestInvitationService.acceptInstParentRequest).toHaveBeenCalledWith(request.key);
                expect(request.status).toEqual('accepted');
                expect(mdDialog.hide).toHaveBeenCalled();
                expect(messageService.showToast).toHaveBeenCalledWith('Solicitação aceita com sucesso');
            });
        });

        describe('Test rejectRequest', function () {
            it('should reject the parent request', function () {
                spyOn(mdDialog, 'cancel');
                analyseHierReqCtrl.rejectRequest();
                expect(requestInvitationService.rejectInstParentRequest).toHaveBeenCalledWith(request.key);
                expect(request.status).toEqual('rejected');
                expect(mdDialog.cancel).toHaveBeenCalled();
                expect(messageService.showToast).toHaveBeenCalledWith('Solicitação rejeitada com sucesso');
            });
        });
    });

    describe('Analyse request institution child', function() {

        beforeEach(function () {
            request.type_of_invite = REQUEST_CHILDREN;
            analyseHierReqCtrl = createCtrl(request);
            spyOn(requestInvitationService, 'acceptInstChildrenRequest').and.callFake(fakeCallback);
            spyOn(requestInvitationService, 'rejectInstChildrenRequest').and.callFake(fakeCallback);
            spyOn(messageService, 'showToast');
        });

        describe('Test loadInstitutions', function () {
            it('should set parent and child', function() {
                expect(analyseHierReqCtrl.parent).toBe(request.institution);
                expect(analyseHierReqCtrl.child).toBe(requestedInstitution);
            });
        });

        describe('Test rejectRequest', function () {  // It is the same test for both scenarios
            it('should reject the parent request', function () {
                spyOn(mdDialog, 'cancel');
                analyseHierReqCtrl.rejectRequest();
                expect(requestInvitationService.rejectInstChildrenRequest).toHaveBeenCalledWith(request.key);
                expect(request.status).toEqual('rejected');
                expect(mdDialog.cancel).toHaveBeenCalled();
                expect(messageService.showToast).toHaveBeenCalledWith('Solicitação rejeitada com sucesso');
            });
        });

        describe('When the child does not have a parent', function () {
            
            describe('Test hasToRemoveLink', function () {
                it('should be falsy', function() {
                    expect(analyseHierReqCtrl.hasToRemoveLink).toBeFalsy();
                });
            });
            
            describe('Test confirmRequest', function () {
                it('should accept the child request', function () {
                    spyOn(mdDialog, 'hide');
                    analyseHierReqCtrl.confirmRequest();
                    expect(requestInvitationService.acceptInstChildrenRequest).toHaveBeenCalledWith(request.key);
                    expect(request.status).toEqual('accepted');
                    expect(mdDialog.hide).toHaveBeenCalled();
                    expect(messageService.showToast).toHaveBeenCalledWith('Solicitação aceita com sucesso');
                });
            });
        });

        describe('When the child has a parent', function () {
            var previousParent;

            beforeEach(function () {
                previousParent = new Institution({key: 'previousParentKey'});
                requestedInstitution.parent_institution = previousParent;
                analyseHierReqCtrl = createCtrl(request);
                spyOn(institutionService, 'removeLink').and.callFake(fakeCallback);
                spyOn(mdDialog, 'hide');
            });

            describe('Test hasToRemoveLink', function () {
                it('should be truthy', function() {
                    expect(analyseHierReqCtrl.hasToRemoveLink).toBeTruthy();
                });
            });
            
            describe('Test confirmRequest', function () {
                it('should accept the child request', function () {
                    analyseHierReqCtrl.confirmRequest();
                    const isParent = true;
                    expect(institutionService.removeLink).toHaveBeenCalledWith(
                        analyseHierReqCtrl.child.key,
                        analyseHierReqCtrl.child.parent_institution.key,
                        isParent
                    );
                    expect(requestInvitationService.acceptInstChildrenRequest).toHaveBeenCalledWith(request.key);
                    expect(request.status).toEqual('accepted');
                    expect(mdDialog.hide).toHaveBeenCalled();
                    expect(messageService.showToast).toHaveBeenCalledWith('Solicitação aceita com sucesso');
                });
            });
        });
    });  
}));
