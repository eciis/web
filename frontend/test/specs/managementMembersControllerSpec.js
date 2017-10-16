'use strict';

(describe('Test ManagementMembersController', function() {
    var INSTITUTIONS_URI = "/api/institutions/";
    var REQUESTS_URI = "/api/institutions/";

    var manageMemberCtrl, httpBackend, scope, inviteService, createCtrl, state, authService,
        mdDialog, institutionService;

    var invite = new Invite({invitee: "mayzabeel@gmail.com",
                        type_of_invite: 'USER',
                        institution_key: '987654321',
                        admin_key: '12345'});

    var otherInvite = new Invite({invitee: "pedro@gmail.com",
                        type_of_invite: 'USER',
                        institution_key: '987654321',
                        admin_key: '12345'});

    var institution = {
            name: 'institution',
            key: '987654321',
            sent_invitations: [invite]  ,
            members: [member]
    };

    var member = {
        name: 'tiago',
        cpf: '121.445.044-07',
        key: '12345',
        email: 'member@gmail.com',
        institutions: [institution.key]
    };

    var user = {
         name: 'Maiana',
         cpf: '121.445.044-07',
         key: '12345',
         email: 'maiana.brito@ccc.ufcg.edu.br',
         institutions: [institution.key]
     };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $mdDialog, $httpBackend, $rootScope, $state, InviteService, AuthService,
        InstitutionService) {
        httpBackend = $httpBackend;
        mdDialog = $mdDialog;
        scope = $rootScope.$new();
        state = $state;
        inviteService = InviteService;
        institutionService = InstitutionService;
        httpBackend.when('GET', INSTITUTIONS_URI + institution.key).respond(institution);
        httpBackend.when('GET', REQUESTS_URI + institution.key + "/requests/user").respond([]);
        httpBackend.when('GET', INSTITUTIONS_URI + institution.key + '/members').respond([member, user]);
        httpBackend.when('GET', 'app/institution/institution_page.html').respond(200);
        httpBackend.when('GET', "app/main/main.html").respond(200);
        httpBackend.when('GET', "app/home/home.html").respond(200);
        httpBackend.when('GET', 'app/auth/login.html').respond(200);
        httpBackend.when('GET', "app/user/user_inactive.html").respond(200);
        authService = AuthService;

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

        it('should exist one sent sent invitations', function() {
            expect(manageMemberCtrl.sent_invitations).toEqual([invite]);
            expect(manageMemberCtrl.sent_invitations.length).toBe(1);
        });
    });

    describe('ManagementMembersController functions', function() {

        describe('deleteMember()', function(){
            beforeEach(function() {
              spyOn(mdDialog, 'confirm').and.callThrough();
              spyOn(mdDialog, 'show').and.callFake(function(){
                return {
                  then: function(callback) {
                    return callback();
                  }
                };
              });
              spyOn(institutionService, 'removeMember').and.callThrough();
            });

            it('Should remove event of events', function() {
                httpBackend.expect('DELETE', INSTITUTIONS_URI + institution.key +
                        "/members?removeMember=" + member.key).respond(200);
                manageMemberCtrl.removeMember("$event", member);

                httpBackend.flush();

                expect(institutionService.removeMember).toHaveBeenCalled();
                expect(mdDialog.confirm).toHaveBeenCalled();
                expect(mdDialog.show).toHaveBeenCalled();
            });
          });

        describe('sendUserInvite()', function() {
            beforeEach(function() {
                spyOn(inviteService, 'sendInvite').and.callFake(function() {
                    return {
                        then: function(callback) {
                            return callback();
                        }
                    };
                });
            });

            it('should call inviteService.sendInvite()', function(done) {
                manageMemberCtrl.invite.invitee = "pedro@gmail.com";
                expect(manageMemberCtrl.sent_invitations.length).toBe(1);
                var promise = manageMemberCtrl.sendUserInvite();
                promise.then(function() {
                    expect(inviteService.sendInvite).toHaveBeenCalledWith(otherInvite);
                    expect(manageMemberCtrl.invite).toEqual({});
                    expect(manageMemberCtrl.showButton).toBe(true);
                    expect(manageMemberCtrl.sent_invitations).toContain(invite);
                    expect(manageMemberCtrl.sent_invitations).toContain(otherInvite);
                    expect(manageMemberCtrl.sent_invitations.length).toBe(2);
                    done();
                });
                scope.$apply();
            });
        });

        describe('isUserInviteValid()', function() {

            it('should be true with new invite', function() {
                var newInvite = new Invite({invitee: "pedro@gmail.com",
                                            type_of_invite: 'USER',
                                            institution_key: '987654321',
                                            admin_key: '12345'});
                expect(manageMemberCtrl.isUserInviteValid(newInvite)).toBe(true);
            });

            it('should be false when the invitee was already invited', function() {
                var inviteInvited = new Invite({invitee: "mayzabeel@gmail.com",
                                            type_of_invite: 'USER',
                                            institution_key: '987654321',
                                            admin_key: '12345'});
                expect(manageMemberCtrl.isUserInviteValid(inviteInvited)).toBe(false);
            });

            it('should be false when the invitee was already member', function() {
                var inviteMember = new Invite({invitee: "member@gmail.com",
                                            type_of_invite: 'USER',
                                            institution_key: '987654321',
                                            admin_key: '12345'});
                expect(manageMemberCtrl.isUserInviteValid(inviteMember)).toBe(false);
            });
        });

        describe('cancelInvite()', function() {
            it('should clear the object invite', function() {
                manageMemberCtrl.invite = invite;
                manageMemberCtrl.cancelInvite();

                expect(manageMemberCtrl.invite).toEqual({});
                expect(manageMemberCtrl.showButton).toBe(true);
            });
        });
    });
}));