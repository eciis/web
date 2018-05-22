'use strict';

(describe('Test ManagementMembersController', function() {
    var INSTITUTIONS_URI = "/api/institutions/";
    var REQUESTS_URI = "/api/institutions/";

    var manageMemberCtrl, httpBackend, scope, inviteService, createCtrl, state, authService,
        mdDialog, institutionService, requestInvitationService;

    var invite = new Invite({invitee: "testuser@example.com",
                        type_of_invite: 'USER',
                        status: 'sent',
                        institution_key: '987654321',
                        key: '123',
                        admin_key: '12345'});

    var otherInvite = new Invite({invitee: "other_user@example.com",
                        type_of_invite: 'USER',
                        status: 'sent',
                        institution_key: '987654321',
                        admin_key: '12345'});

    var admin = {
        name: 'Admin',
        key: '145',
    };

    var institution = {
            name: 'institution',
            key: '987654321',
            admin: admin,
            sent_invitations: [invite, otherInvite]  ,
            members: [member, admin]
    };

    var member = {
        name: 'Member',
        cpf: '121.445.044-07',
        key: '12345',
        email: ['member@gmail.com'],
        institutions: [institution]
    };

    var user = {
         name: 'User',
         cpf: '121.445.044-07',
         key: '54321',
         email: ['user@example.com'],
         institutions: [institution]
     };

     var request = {
         status: 'sent',
         key: '123',
         type_of_invite: 'REQUEST_USER',
         institutional_email: 'request@gmail.com'
     }

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $mdDialog, $httpBackend, $rootScope, $state, InviteService, AuthService,
        InstitutionService, RequestInvitationService) {
        httpBackend = $httpBackend;
        mdDialog = $mdDialog;
        scope = $rootScope.$new();
        state = $state;
        inviteService = InviteService;
        institutionService = InstitutionService;
        httpBackend.when('GET', INSTITUTIONS_URI + institution.key).respond(institution);
        httpBackend.when('GET', REQUESTS_URI + institution.key + "/requests/user").respond([request]);
        httpBackend.when('GET', INSTITUTIONS_URI + institution.key + '/members').respond([member, user]);
        httpBackend.when('GET', 'app/institution/institution_page.html').respond(200);
        httpBackend.when('GET', "app/main/main.html").respond(200);
        httpBackend.when('GET', "app/home/home.html").respond(200);
        httpBackend.when('GET', 'app/auth/login.html').respond(200);
        httpBackend.when('GET', "app/user/user_inactive.html").respond(200);
        authService = AuthService;
        requestInvitationService = RequestInvitationService;

        authService.getCurrentUser = function() {
            return new User(user);
        };

        createCtrl = function() {
            return $controller('ManagementMembersController',
                {
                    scope: scope,
                    inviteService: InviteService,
                    authService: authService,
                    institutionService: InstitutionService
                });
        };
        state.params.institutionKey = institution.key;
        manageMemberCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('ManagementMembersController properties', function() {

        it('should exist two sent sent invitations', function() {
            expect(manageMemberCtrl.sent_invitations).toEqual([invite, otherInvite]);
            expect(manageMemberCtrl.sent_invitations.length).toBe(2);
        });
    });

    describe('ManagementMembersController functions', function() {

        describe('removeMember()', function(){

            it('should contains two members before removeMember', function() {
                expect(manageMemberCtrl.members).toEqual([member, user]);
            });

            it('Should contains one member after removeMember', function() {
                manageMemberCtrl.removeMember(user);
                expect(manageMemberCtrl.members).toEqual([member]);
                manageMemberCtrl.members.push(user);
            });
          });

        describe('openRemoveMemberDialog()', function() {

            it('Should call mdDialog.show()', function() {
                spyOn(mdDialog, 'show');
                manageMemberCtrl.openRemoveMemberDialog();
                expect(mdDialog.show).toHaveBeenCalled();
            });
        });

        describe('sendUserInvite()', function() {
            beforeEach(function() {
                spyOn(inviteService, 'sendInvite').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback(
                                { data: { 
                                          'msg': 'Os convites estão sendo processados.'.clone,
                                          'invites': [{ 'email': "teste@gmail.com", 'key': '123' }]
                                        }
                                }
                            );
                        }
                    };
                });
            });

            it('should call inviteService.sendInvite()', function(done) {
                manageMemberCtrl.invite = {
                    type_of_invite: 'USER',
                    institution_key: '987654321',
                    admin_key: '54321',
                    sender_name: 'User',
                    key: '123'
                };
                manageMemberCtrl.emails = [{ email: "teste@gmail.com" }]
                var newInvite = new Invite(manageMemberCtrl.invite);
                var requestBody = {
                    invite_body: newInvite,
                    emails: ["teste@gmail.com"]
                }
                expect(manageMemberCtrl.sent_invitations.length).toBe(2);
                var promise = manageMemberCtrl.sendUserInvite();
                promise.then(function() {
                    var expectedInvite = _.clone(newInvite);
                    expectedInvite.invitee = "teste@gmail.com";
                    expect(inviteService.sendInvite).toHaveBeenCalledWith(requestBody);
                    expect(manageMemberCtrl.invite).toEqual({});
                    expect(manageMemberCtrl.sent_invitations).toContain(invite);
                    expect(manageMemberCtrl.sent_invitations).toContain(expectedInvite);
                    expect(manageMemberCtrl.sent_invitations.length).toBe(3);
                    done();
                });
                scope.$apply();
            });
        });

        describe('isUserInviteValid()', function() {

            it('should be true with new invite', function() {
                var newInvite = new Invite({type_of_invite: 'USER',
                                            institution_key: '987654321',
                                            admin_key: '12345'});
                expect(manageMemberCtrl.isUserInviteValid(newInvite)).toBe(true);
            });
        });

        describe('isValidAllEmails()', function() {

            it('should be false when the invitee was already invited', function() {
                var inviteInvited = new Invite({type_of_invite: 'USER',
                                            institution_key: '987654321',
                                            admin_key: '12345'});
                manageMemberCtrl.emails = [{'email' : "testuser@example.com"}];
                expect(manageMemberCtrl.isValidAllEmails(["testuser@example.com"])).toBe(false);
            });

            it('should be false when the invitee was already member', function() {
                var inviteMember = new Invite({type_of_invite: 'USER',
                                            institution_key: '987654321',
                                            admin_key: '12345'});

                 manageMemberCtrl.emails = [{'email' :"member@gmail.com"}];
                expect(manageMemberCtrl.isValidAllEmails(["member@gmail.com"])).toBe(false);
            });

            it('should be false when the email was written more then one times', function() {
                var inviteMember = new Invite({type_of_invite: 'USER',
                                            institution_key: '987654321',
                                            admin_key: '12345'});

                manageMemberCtrl.emails = [{'email': "new@gmail.com"}, {'email': "new@gmail.com"}];
                expect(manageMemberCtrl.isValidAllEmails(["new@gmail.com", "new@gmail.com"])).toBe(false);
            });

            it('should be false when the invitee requested an invitation', function() {
                var inviteMember = new Invite({type_of_invite: 'USER',
                                            institution_key: '987654321',
                                            admin_key: '12345'});

                 manageMemberCtrl.emails = [{'email': 'request@gmail.com'}];
                expect(manageMemberCtrl.isValidAllEmails(['request@gmail.com'])).toBe(false);
            });

           it('should be true', function() {
                var inviteMember = new Invite({type_of_invite: 'USER',
                                            institution_key: '987654321',
                                            admin_key: '12345'});

                 manageMemberCtrl.emails = [{'email': 'email@gmail.com'}];
                expect(manageMemberCtrl.isValidAllEmails(['email@gmail.com'])).toBe(true);
            });
        });

        describe('removePendingAndMembersEmails()', function() {
            it('Should return emails that are according to with the conditions(is not a member, was not sent the invite,'+
                 ' was not request the invite, is not duplicated.', function() {
                var emails = ["testuser@example.com", "member@gmail.com", "new@gmail.com", "new@gmail.com",
                                                "request@gmail.com", "email@gmail.com"];
                var filteredEmails = manageMemberCtrl.removePendingAndMembersEmails(emails);
                expect(filteredEmails).toEqual(["new@gmail.com", "email@gmail.com"]);
            });
        });

        describe('clearInvite()', function() {
            it('should clear the object invite', function() {
                manageMemberCtrl.invite = invite;
                manageMemberCtrl.clearInvite();

                expect(manageMemberCtrl.invite).toEqual({});
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

                manageMemberCtrl.resendInvite(invite.key, '$event');

                expect(mdDialog.confirm).toHaveBeenCalled();
                expect(mdDialog.show).toHaveBeenCalled();
                expect(inviteService.resendInvite).toHaveBeenCalled();
            });
        });

        describe('disableTransferAdminButton', function() {

            it('Should return true if invitation sent', function() {
                var data = {
                    status: 'sent'
                };
                var invite = new Invite(data);

                manageMemberCtrl.sentInvitationsAdm = [invite];

                expect(manageMemberCtrl.disableTransferAdminButton()).toBeTruthy();
            });

            it('Should return false if no invitation sent', function() {
                var data = {
                    status: 'rejected'
                };
                var invite = new Invite(data);

                manageMemberCtrl.sent_invitations_adm = [invite];
                expect(manageMemberCtrl.disableTransferAdminButton()).toBeFalsy();
            });
        });
    
        describe('openAcceptRequestDialog', function() {
            beforeEach(function() {
                spyOn(mdDialog, 'show').and.callFake(function() {
                    return {
                        then: function(callback) {
                            callback(request.key);
                        }
                    };
                });
            });

            it('Should remove request', function() {
                expect(manageMemberCtrl.requests).toEqual([request]);
                manageMemberCtrl.openAcceptRequestDialog(request, 'event');
                expect(manageMemberCtrl.requests).toEqual([]);
            });  
        });

        describe('limitString()', function () {
            it('should call limitString', function () {
                spyOn(Utils, 'limitString').and.callThrough();
                const result = manageMemberCtrl.limitString('Test string', 5);
                expect(_.size(result)).toEqual(9);
                expect(Utils.limitString).toHaveBeenCalled();
            });
        });
    });
}));