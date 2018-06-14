'use strict';

(describe('Test InviteInstitutionController', function() {

    var inviteinstitutionCtrl, httpBackend, scope, inviteService, createCtrl, state, instService, mdDialog, requestInvitationService;

    var institution = {
            name: 'institution',
            key: '987654321',
            sent_invitations: []
    };

    var user = {
        name: 'user',
        institutions: [institution],
        current_institution: institution,
        follows: institution.key,
        permissions : {
            analyze_request_inst: {
                '987654321': true
            }
        },
        invites:[]
    };

    var request = {
        admin_name: 'example',
        institution_key: institution.key,
        institution_requested_key: institution.key,
        key: '000000',
        sender: 'admin',
        status: 'sent',
    }

    var INSTITUTION_SEARCH_URI = '/api/search/institution?value=';

    var invite = new Invite({invitee: "user@gmail.com", suggestion_institution_name : "New Institution", key: '123'}, 'institution', institution.key);

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, $mdDialog,
        InviteService, AuthService, InstitutionService, RequestInvitationService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        mdDialog = $mdDialog;
        inviteService = InviteService;
        instService = InstitutionService;
        requestInvitationService = RequestInvitationService;

        AuthService.login(user);

        httpBackend.expect('GET', '/api/invites/institution').respond([]);
        httpBackend.expect('GET', '/api/institutions/requests/institution/987654321').respond([]);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', "auth/login.html").respond(200);

        createCtrl = function() {
            return $controller('InviteInstitutionController',
                {
                    scope: scope,
                    inviteService: InviteService,
                });
        };
        state.params.institutionKey = institution.key;
        inviteinstitutionCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('InviteInstitutionController properties', function() {

        it('should exist a user and his name is user', function() {
            expect(inviteinstitutionCtrl.user.name).toEqual(user.name);
        });
    });

    describe('InviteInstitutionController functions', function() {

        describe('sendInstInvite()', function() {
            beforeEach(function() {
                spyOn(inviteService, 'sendInviteInst').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback(
                                {data: {key: '123'}}
                            );
                        }
                    };
                });
                inviteinstitutionCtrl.invite = invite;
            });

            it('should call inviteService.sendInvite()', function(done) {
                inviteinstitutionCtrl.user.current_institution = institution;
                var promise = inviteinstitutionCtrl.sendInstInvite(invite);
                promise.then(function() {
                    expect(inviteService.sendInviteInst).toHaveBeenCalledWith(invite);
                    done();
                });
            });

            it('should call sendInvite() and searchInstitutions()', function(done) {
                spyOn(instService, 'searchInstitutions').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback({});
                        }
                    };
                });
                spyOn(inviteinstitutionCtrl, 'sendInstInvite');
                inviteinstitutionCtrl.user.current_institution = institution;
                inviteinstitutionCtrl.checkInstInvite().then(function() {
                    var testingInvite = new Invite(invite, 'INSTITUTION', institution.key);
                    expect(instService.searchInstitutions).toHaveBeenCalledWith(
                        inviteinstitutionCtrl.invite.suggestion_institution_name,
                        "active,pending", 'institution');
                    expect(inviteinstitutionCtrl.sendInstInvite).toHaveBeenCalledWith(testingInvite);
                    done();
                });
            });

            it('should call showDialog()', function(done) {
                var documents = {data: {name: institution.name, id: institution.key}};
                spyOn(inviteinstitutionCtrl, 'showDialog');
                spyOn(instService, 'searchInstitutions').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback(documents);
                        }
                    };
                });
                inviteinstitutionCtrl.checkInstInvite().then(function() {
                    expect(inviteinstitutionCtrl.showDialog).toHaveBeenCalled();
                    done();
                });
            });

            it('should change properties invite and sent_invitations', function(done){
                var promise = inviteinstitutionCtrl.sendInstInvite(invite);
                promise.then(function() {
                    expect(inviteinstitutionCtrl.invite).toEqual({});
                    expect(inviteinstitutionCtrl.showInvites).toBe(true);
                    expect(inviteinstitutionCtrl.showSendInvites).toBe(false);
                    expect(invite.status).toEqual('sent');
                    expect(inviteinstitutionCtrl.sent_invitations).toEqual([invite]);
                    done();
                });
            });
        });

        describe('cancelInvite()', function() {
            it('should clear the object invite', function() {
                inviteinstitutionCtrl.invite = {
                    invitee: "invitee@gmail.com",
                    suggestion_institution_name : "Institution"
                };
                inviteinstitutionCtrl.cancelInvite();
                expect(inviteinstitutionCtrl.invite).toEqual({});
                expect(inviteinstitutionCtrl.showSendInvites).toBe(true);
            });
        });

        describe('resendInvite()', function () {
            it('should resend the invite', function () {
                spyOn(mdDialog, 'confirm').and.callThrough();
                spyOn(mdDialog, 'show').and.callFake(function () {
                    return {
                        then: function (callback) {
                            return callback();
                        }
                    };
                });
                spyOn(inviteService, 'resendInvite').and.callFake(function () {
                    return {
                        then: function (callback) {
                            return callback();
                        }
                    };
                });

                inviteinstitutionCtrl.resendInvite(invite.key, '$event');

                expect(mdDialog.confirm).toHaveBeenCalled();
                expect(mdDialog.show).toHaveBeenCalled();
                expect(inviteService.resendInvite).toHaveBeenCalled();
            });
        });

        describe('showPendingRequestDialog', function () {
            it('should call show()', function () {
                spyOn(mdDialog, 'show').and.callFake(function () {
                    return {
                        then: function (callback) {
                            return callback();
                        }
                    };
                });
                inviteinstitutionCtrl.sent_requests = [request];
                inviteinstitutionCtrl.showPendingRequestDialog('$event', request);
                expect(mdDialog.show).toHaveBeenCalled();
                expect(request.status).toBe('accepted');
                expect(inviteinstitutionCtrl.sent_requests).toEqual([]);
            });
        });
    });
}));