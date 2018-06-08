'use strict';

(describe('Test InviteInstHierarchieController', function () {
    const REQUEST_INSTITUTION_CHILDREN = 'REQUEST_INSTITUTION_CHILDREN';
    const REQUEST_INSTITUTION_PARENT = 'REQUEST_INSTITUTION_PARENT';

    var httpBackend, scope, state, mdDialog, instService, requestInvitationService, 
        inviteService, inviteInstHierarchieCtrl, createCtrl, messageService, q;
    
    var institution = {
        name: 'institution',
        key: 'kaopsdkoas-IAKSDOoksHo',
        sent_invitations: [],
        children_institutions: [],
        state: 'active'
    };

    var otherInst = {
        name: 'other',
        key: 'djlakjdks-sdshdjshda',
        sent_invitations: [],
        children_institutions: [],
        state: 'active'
    }

    var childrenStub = new Institution({name: "Children Institution", state : "pending"});

    var user = {
        name: 'user',
        institutions: [institution],
        current_institution: institution,
        follows: institution.key,
        permissions: {
            analyze_request_inst: {
                '987654321': true
            }
        },
        invites: []
    };

    var invite = new Invite({ invitee: "user@gmail.com", suggestion_institution_name: "New Institution", key: '123', type_of_invite: "INSTITUTION_PARENT" }, 
        'institution', institution.key);

    var inviteChildren = new Invite({ invitee: "user@gmail.com", suggestion_institution_name: "Children Institution", key: '123', type_of_invite: "INSTITUTION_CHILDREN" }, 
        'institution', institution.key);

    beforeEach(module('app'));

    beforeEach(inject(function ($controller, $httpBackend, $rootScope, $state, $mdDialog, 
        AuthService, InstitutionService, RequestInvitationService, InviteService, MessageService, $q) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdDialog = $mdDialog;
        instService = InstitutionService;
        requestInvitationService = RequestInvitationService;
        inviteService = InviteService;
        messageService = MessageService;
        q = $q;

        AuthService.login(user);

        httpBackend.expect('GET', `/api/institutions/${institution.key}`).respond(institution);
        httpBackend.when('GET', `/api/institutions/${institution.key}/requests/institution_children`).respond([]);
        httpBackend.when('GET', `/api/institutions/${institution.key}/requests/institution_parent`).respond([]);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', "auth/login.html").respond(200);

        createCtrl = function () {
            return $controller('InviteInstHierarchieController',
                {
                    scope: scope,
                    RequestInvitationService: RequestInvitationService,
                    InviteService: InviteService,
                    InstitutionService: InstitutionService
                });
        };

        // These spies check if the functions that are called as soon as the controller gets instantiated are really being called
        spyOn(instService, 'getInstitution').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback({ data: institution });
                }
            };
        });
        spyOn(requestInvitationService, 'getParentRequests').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback([]);
                }
            };
        });
        spyOn(requestInvitationService, 'getChildrenRequests').and.callFake(function () {
            return {
                then: function (callback) {
                    return callback([]);
                }
            };
        });

        state.params.institutionKey = institution.key;
        inviteInstHierarchieCtrl = createCtrl();

        expect(requestInvitationService.getParentRequests).toHaveBeenCalled();
        expect(requestInvitationService.getChildrenRequests).toHaveBeenCalled();
        expect(instService.getInstitution).toHaveBeenCalled();
    }));

    describe('InviteInstHierarchieController properties', function() {

        it('should exist a user with name user', function() {
            expect(inviteInstHierarchieCtrl.user.name).toEqual(user.name);
        });

        it('should be equal to institution', function() {
            expect(inviteInstHierarchieCtrl.institution.name).toEqual(institution.name);
            expect(inviteInstHierarchieCtrl.institution.key).toEqual(institution.key);
        });
    });

    describe('checkInstInvite', function() {
        beforeEach(function() {
            spyOn(messageService, 'showToast');
        });
        
        it('should call showToast with invalid invite message', function () {
            inviteInstHierarchieCtrl.invite = {};
            inviteInstHierarchieCtrl.checkInstInvite('$event');
            expect(messageService.showToast).toHaveBeenCalledWith('Convite inválido!');
        });

        it('should call showToast with institution has already have a parent message', function() {
            inviteInstHierarchieCtrl.invite = invite;
            inviteInstHierarchieCtrl.hasParent = true;
            inviteInstHierarchieCtrl.checkInstInvite('$event');
            expect(messageService.showToast).toHaveBeenCalledWith("Já possui instituição superior");
        });

        it('should call searchInstitutions', function(done) {
            spyOn(instService, 'searchInstitutions').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback({data: {}});
                    }
                };
            });
            spyOn(inviteInstHierarchieCtrl, 'processInvite');
            inviteInstHierarchieCtrl.invite = invite;
            inviteInstHierarchieCtrl.checkInstInvite('$event').then(function(){
                expect(instService.searchInstitutions).toHaveBeenCalled();
                expect(inviteInstHierarchieCtrl.processInvite).toHaveBeenCalled();
                done();
            });
        });
    });

    describe('processInvite', function () {
        it('should call sendInstInvite', function () {
            spyOn(inviteInstHierarchieCtrl, 'sendInstInvite');
            inviteInstHierarchieCtrl.processInvite({}, '$event');
            expect(inviteInstHierarchieCtrl.sendInstInvite).toHaveBeenCalled();
        });

        it('should call showDialog', function () {
            spyOn(inviteInstHierarchieCtrl, 'showDialog');
            inviteInstHierarchieCtrl.processInvite(institution, '$event');
            expect(inviteInstHierarchieCtrl.showDialog).toHaveBeenCalled();
        });
    });

    describe('sendInstInvite', function () {
        beforeEach(function() {
            spyOn(inviteService, 'sendInviteHierarchy').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });
        });

        it('should call sendInviteHierarchy', function() {
            spyOn(messageService, 'showToast');
            inviteInstHierarchieCtrl.institution.sent_invitations = [];
            inviteInstHierarchieCtrl.sendInstInvite(invite);
            expect(inviteInstHierarchieCtrl.showParentHierarchie).toBeTruthy();
            expect(inviteService.sendInviteHierarchy).toHaveBeenCalled();
            expect(messageService.showToast).toHaveBeenCalled();
        });
    });

    describe('showDialog()', function() {
        it('shoul call show', function () {
            spyOn(mdDialog, 'show');
            inviteInstHierarchieCtrl.showDialog();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('sendRequestToExistingInst()', function() {
        it('should call sendRequestToParentInst', function () {
            spyOn(requestInvitationService, 'sendRequestToParentInst').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });
            inviteInstHierarchieCtrl.sendRequestToExistingInst(invite, institution.key);
            expect(inviteInstHierarchieCtrl.showParentHierarchie).toBeTruthy();
            expect(inviteInstHierarchieCtrl.hasParent).toBeTruthy();
        });

        it('should call sendRequestToChildInst', function () {
            spyOn(requestInvitationService, 'sendRequestToChildrenInst').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });
            inviteInstHierarchieCtrl.institution.children_institutions = [];
            inviteInstHierarchieCtrl.requested_invites = [];
            inviteInstHierarchieCtrl.sendRequestToExistingInst(invite, institution.key);
            expect(inviteInstHierarchieCtrl.showChildrenHierarchie).toBeTruthy();
            expect(inviteInstHierarchieCtrl.hasParent).toBeFalsy();
        });
    });

    describe('cancelInvite()', function() {
        it('should clear the invite', function() {
            inviteInstHierarchieCtrl.cancelInvite();
            expect(inviteInstHierarchieCtrl.showSendInvite).toBeFalsy();
            expect(inviteInstHierarchieCtrl.invite).toEqual({});
        });
    });

    describe('goToActiveInst', function() {
        it('should go', function() {
            spyOn(inviteInstHierarchieCtrl, 'isActive').and.callThrough();
            spyOn(inviteInstHierarchieCtrl, 'goToInst').and.callThrough();
            spyOn(state, 'go');

            inviteInstHierarchieCtrl.goToActiveInst(institution);
            expect(inviteInstHierarchieCtrl.isActive).toHaveBeenCalled();
            expect(inviteInstHierarchieCtrl.goToInst).toHaveBeenCalled();
            expect(state.go).toHaveBeenCalled();
        });

        it('should not go', function() {
            spyOn(messageService, 'showToast');
            spyOn(state, 'go');
            institution.state = 'inactive';
            inviteInstHierarchieCtrl.goToActiveInst(institution);
            expect(messageService.showToast).toHaveBeenCalled();
            expect(state.go).not.toHaveBeenCalled();
        });
    });

    describe('canRemoveInst', function() {
        it('should be true', function() {
            var children_institution = {
                key: 'key-1234',
                state: 'active',
                parent_institution: institution.key
            };
            user.permissions['remove_inst'] = _.set({}, children_institution.key, true);
            institution.children_institutions = [children_institution.key] 
            
            expect(inviteInstHierarchieCtrl.canRemoveInst(children_institution)).toBeTruthy();
        });

        it("should be false, because don't have parent inst", function() {
            var children_institution = {
                key: 'key-1234',
                state: 'active'
            };
            user.permissions['remove_inst'] = _.set({}, children_institution.key, true);
            institution.children_institutions = [] 
            
            expect(inviteInstHierarchieCtrl.canRemoveInst(children_institution)).toBeFalsy();
        });

        it('should be false, because the user dont have permission', function() {
            var children_institution = {
                key: 'key-1234',
                state: 'active',
                parent_institution: institution.key
            };
            user.permissions.remove_inst[children_institution.key] = false;
            institution.children_institutions = [children_institution.key] 
            
            expect(inviteInstHierarchieCtrl.canRemoveInst(children_institution)).toBeFalsy();
        });
    });

    describe('removeLink()', function () {
        var otherInst;

        beforeEach(function() {
            spyOn(mdDialog, 'confirm').and.callThrough();
            spyOn(mdDialog, 'show').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });
            spyOn(instService, 'removeLink').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });

            otherInst = {key: 'poaksdpoksapo-OPEaLDLS'};
        });

        it('should remove parent link', function () {
            inviteInstHierarchieCtrl.removeLink("event", otherInst, true);
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
            expect(instService.removeLink).toHaveBeenCalled();
            expect(inviteInstHierarchieCtrl.institution.parent_institution).toEqual({});
            expect(inviteInstHierarchieCtrl.hasParent).toBeFalsy();
        });

        it('should remove child link', function() {
            inviteInstHierarchieCtrl.institution.children_institutions = [otherInst];
            expect(inviteInstHierarchieCtrl.institution.children_institutions).toEqual([otherInst]);
            inviteInstHierarchieCtrl.removeLink(otherInst, false, "event");
            expect(mdDialog.confirm).toHaveBeenCalled();
            expect(mdDialog.show).toHaveBeenCalled();
            expect(instService.removeLink).toHaveBeenCalled();
            expect(inviteInstHierarchieCtrl.institution.children_institutions).toEqual([]);
        });
    });

    describe('analyseRequest', function () {
        var instRequested, instRequesting, request;
       
        beforeEach(function() {
            instRequesting = new Institution({
                key: 'requester-key',
                name: 'Requester',
                parent_institution: null,
                children_institutions: []
            });

            instRequested = new Institution({
                key: 'requested-key',
                name: 'Requested',
                parent_institution: null,
                children_institutions: []
            });            
            
            inviteInstHierarchieCtrl.institution = instRequested;

            request = {
                institution: instRequesting,
                type_of_invite: REQUEST_INSTITUTION_CHILDREN
            };

            spyOn(requestInvitationService, 'showHierarchyDialog').and.callFake(function () {
                return {
                    then: function (callback) {
                        return callback();
                    }
                };
            });
        })
        
        it('should accept a request children and link institutions', function() {
            inviteInstHierarchieCtrl.analyseRequest(event, request);
            expect(requestInvitationService.showHierarchyDialog).toHaveBeenCalledWith(event, instRequested, request);
            expect(inviteInstHierarchieCtrl.hasParent).toBeTruthy()
            expect(inviteInstHierarchieCtrl.showParentHierarchie).toBeTruthy();
            expect(inviteInstHierarchieCtrl.institution.parent_institution).toBe(request.institution);
            expect(request.institution.children_institutions[0]).toBe(inviteInstHierarchieCtrl.institution);
        });

        it('should accept a request parent and link institutions', function() {
            request.type_of_invite = REQUEST_INSTITUTION_PARENT;
            inviteInstHierarchieCtrl.analyseRequest(event, request);
            expect(requestInvitationService.showHierarchyDialog).toHaveBeenCalledWith(event, instRequested, request);
            expect(inviteInstHierarchieCtrl.showChildrenHierarchie).toBeTruthy()
            expect(request.institution.parent_institution).toBe(inviteInstHierarchieCtrl.institution);
            expect(inviteInstHierarchieCtrl.institution.children_institutions[0]).toBe(request.institution);
        });
    });

    describe('isReqSentByCurrentInst()', function() {        
        it('should return true', function() {
            let request = {institution_key: institution.key};
            const returnedValue = inviteInstHierarchieCtrl.isReqSentByCurrentInst(request);
            expect(returnedValue).toBeTruthy();
        });

        it('should return false', function () {
            let request = { institution_key: 'aoskdosa-AOKSDAopad' };
            const returnedValue = inviteInstHierarchieCtrl.isReqSentByCurrentInst(request);
            expect(returnedValue).toBeFalsy();
        });
    });

    describe('goToRequestedInst', function() {
        beforeEach(function() {
            spyOn(inviteInstHierarchieCtrl, 'isReqSentByCurrentInst').and.callThrough();
            spyOn(inviteInstHierarchieCtrl, 'goToInst');
        });

        it('should call go to inst with institution_key', function() {
            let request = {institution_key: 'kaposdkoas-OKPOA'};
            inviteInstHierarchieCtrl.goToRequestedInst(request);
            expect(inviteInstHierarchieCtrl.isReqSentByCurrentInst).toHaveBeenCalled();
            expect(inviteInstHierarchieCtrl.goToInst).toHaveBeenCalledWith(request.institution_key);
        });

        it('should call go to inst with institution_requested_key', function () {
            let request = { institution_key: institution.key, institution_requested_key: 'aposdkap-OKAPSODPDKOE' };
            inviteInstHierarchieCtrl.goToRequestedInst(request);
            expect(inviteInstHierarchieCtrl.isReqSentByCurrentInst).toHaveBeenCalled();
            expect(inviteInstHierarchieCtrl.goToInst).toHaveBeenCalledWith(request.institution_requested_key);
        });

    });

    describe('getReqInstName', function() {
        beforeEach(function () {
            spyOn(inviteInstHierarchieCtrl, 'isReqSentByCurrentInst').and.callThrough();
        });

        it('should return requested_inst_name', function() {
            let request = {institution_key: institution.key, requested_inst_name: 'test'};
            const returnedValue = inviteInstHierarchieCtrl.getReqInstName(request);
            expect(returnedValue).toEqual(request.requested_inst_name);
        })

        it('should return institution_admin.name', function () {
            let request = { institution_key: 'aksdpsoa-OQKEPQkpa', institution_admin: {name: 'second test'} };
            const returnedValue = inviteInstHierarchieCtrl.getReqInstName(request);
            expect(returnedValue).toEqual(request.institution_admin.name);
        })
    });

    describe('showMessage', function () {
        beforeEach(function () {
            spyOn(inviteInstHierarchieCtrl, 'isReqSentByCurrentInst').and.callThrough();
        });

        it('should return Solicitação para ser uma instituição subordinada (Aguardando confirmação)', function() {
            let request = { institution_key: institution.key, type_of_invite: REQUEST_INSTITUTION_CHILDREN};
            const returnedValue = inviteInstHierarchieCtrl.showMessage(request);
            expect(returnedValue).toEqual('Solicitação para ser uma instituição subordinada (Aguardando confirmação)');
        });

        it('should return Solicitação para ser uma instituição superior (Aguardando confirmação)', function () {
            let request = { institution_key: institution.key};
            const returnedValue = inviteInstHierarchieCtrl.showMessage(request);
            expect(returnedValue).toEqual('Solicitação para ser uma instituição superior (Aguardando confirmação)');
        });

        it('should return Solicitação para ser a instituição superior', function () {
            let request = { institution_key: 'poadka-DKopskl', type_of_invite: REQUEST_INSTITUTION_CHILDREN };
            const returnedValue = inviteInstHierarchieCtrl.showMessage(request);
            expect(returnedValue).toEqual('Solicitação para ser a instituição superior');
        });

        it('should return Solicitação para ser uma instituição subordinada', function () {
            let request = { institution_key: 'poadka-DKopskl', type_of_invite: REQUEST_INSTITUTION_PARENT };
            const returnedValue = inviteInstHierarchieCtrl.showMessage(request);
            expect(returnedValue).toEqual('Solicitação para ser uma instituição subordinada');
        });
    });

    describe('hasRequested()', function() {
        it('should return undefined', function () {
            inviteInstHierarchieCtrl.requested_invites = [];
            var returnedValue = inviteInstHierarchieCtrl.hasRequested();
            expect(returnedValue).toEqual(undefined);

            inviteInstHierarchieCtrl.requested_invites = [{status: 'accepted'}];
            returnedValue = inviteInstHierarchieCtrl.hasRequested();
            expect(returnedValue).toEqual(undefined);
        });

        it('should return a request', function () {
            inviteInstHierarchieCtrl.requested_invites = [{status: 'accepted', institution_requested_key: institution.key},
                {status: 'rejected', institution_requested_key: institution.key}, {status: 'sent', key: '123456', institution_requested_key: institution.key}];
            var returnedValue = inviteInstHierarchieCtrl.hasRequested();
            expect(returnedValue).toEqual({ status: 'sent', key: '123456', institution_requested_key: institution.key });

            inviteInstHierarchieCtrl.requested_invites = [{ status: 'accepted', institution_requested_key: institution.key },
                { status: 'sent', key: '1234', institution_requested_key: institution.key }, { status: 'sent', key: '123456' }];
            returnedValue = inviteInstHierarchieCtrl.hasRequested();
            expect(returnedValue).toEqual({ status: 'sent', key: '1234', institution_requested_key: institution.key });
        })
    });

    describe('removeChild()', function() {
        it('should call show()', function() {
            spyOn(mdDialog, 'show');
            inviteInstHierarchieCtrl.removeChild();
            expect(mdDialog.show).toHaveBeenCalled();
        });
    });

    describe('linkParentStatus', function () {
        var mainInst, secondInst, returnedValue;
        beforeEach(function () {
            mainInst = { key: 'akpakfaoAs-FOAmgkfhmk' };
            secondInst = { key: 'pokasodpkao-AkaksdaaOGM' };
            returnedValue;
        });

        it('should return confirmed', function () {
            mainInst.parent_institution = secondInst;
            secondInst.children_institutions = [mainInst];
            inviteInstHierarchieCtrl.institution = mainInst;

            returnedValue = inviteInstHierarchieCtrl.linkParentStatus();

            expect(returnedValue).toEqual('confirmado');
        });

        it('should return not confirmed', function () {
            inviteInstHierarchieCtrl.institution = mainInst;
            returnedValue = inviteInstHierarchieCtrl.linkParentStatus();
            expect(returnedValue).toEqual('não confirmado');

            mainInst.parent_institution = secondInst;
            expect(inviteInstHierarchieCtrl.institution.parent_institution).toEqual(secondInst);
            returnedValue = inviteInstHierarchieCtrl.linkParentStatus();
            expect(returnedValue).toEqual('não confirmado');
        });
    });

    describe('sendInstInvite() to parent institution', function() {
        beforeEach(function() {

            invite = new Invite({ invitee: "user@gmail.com", suggestion_institution_name: "New Institution", key: '123', type_of_invite: "INSTITUTION_PARENT" }, 
            'institution', institution.key);

            spyOn(inviteService, 'sendInviteHierarchy').and.callFake(function() {return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
        });

        it('should call inviteService.sendInviteHierarchy()', function(done) {
            inviteInstHierarchieCtrl.invite = {
                invitee: "parent@gmail.com",
                suggestion_institution_name : "Institution Parent",
                type_of_invite : "INSTITUTION_PARENT"};

            // Change current institution
            inviteInstHierarchieCtrl.user.current_institution = otherInst;

            var promise = inviteInstHierarchieCtrl.sendInstInvite(invite);
            promise.then(function() {

                expect(inviteService.sendInviteHierarchy).toHaveBeenCalledWith({invite_body: invite});

                // Verifying That Data Is Correctly Updated
                expect(inviteInstHierarchieCtrl.invite).toEqual({});
                expect(inviteInstHierarchieCtrl.institution.key).toEqual(institution.key);
                expect(inviteInstHierarchieCtrl.institution.sent_invitations).toEqual([invite]);
                expect(inviteInstHierarchieCtrl.institution.parent_institution.name).toEqual(
                    invite.suggestion_institution_name);
                expect(inviteInstHierarchieCtrl.hasParent).toEqual(true);

                done();
            });
            scope.$apply();
        });
    });

    describe('sendInstInvite() to children Institution', function() {
        beforeEach(function() {
            institution = {
                name: 'institution',
                key: 'kaopsdkoas-IAKSDOoksHo',
                sent_invitations: [],
                children_institutions: [],
                state: 'active'
            };   

            spyOn(inviteService, 'sendInviteHierarchy').and.callFake(function() {return {
                    then: function(callback) {
                        return callback();
                    }
                };
            });
        });

        it('should call inviteService.sendInviteHierarchy()', function(done) {
            inviteInstHierarchieCtrl.invite = {
                invitee: "children@gmail.com",
                suggestion_institution_name : "Children Institution",
                type_of_invite : "INSTITUTION_CHILDREN"};

            inviteInstHierarchieCtrl.institution = new Institution(institution);
            // Change current institution
            inviteInstHierarchieCtrl.user.current_institution = otherInst;

            var promise = inviteInstHierarchieCtrl.sendInstInvite(inviteChildren);
            promise.then(function() {
                expect(inviteService.sendInviteHierarchy).toHaveBeenCalledWith({invite_body: inviteChildren});

                // Verifying That Data Is Correctly Updated
                expect(inviteInstHierarchieCtrl.invite).toEqual({});
                expect(inviteInstHierarchieCtrl.institution.key).toEqual(institution.key);
                expect(inviteInstHierarchieCtrl.institution.sent_invitations).toEqual([inviteChildren]);
                expect(inviteInstHierarchieCtrl.institution.children_institutions).toContain(childrenStub);

                done();
            });
            scope.$apply();
        });
    });

    describe("limitString()", function () {
        it('should call limitString', function () {
           spyOn(Utils, 'limitString');
           const string = inviteInstHierarchieCtrl.limitString("Testing string", 5);
           expect(Utils.limitString).toHaveBeenCalled();
        });
    });
}));