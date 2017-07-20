'use strict';

(describe('Test InviteUserController', function() {
    var INSTITUTIONS_URI = "/api/institutions/";

    var inviteUserCtrl, httpBackend, scope, inviteService, createCtrl, state;

    var invite = new Invite({invitee: "mayzabeel@gmail.com"}, 'user', '987654321', 'tiago@gmail.com');

    var otherInvite = new Invite({invitee: "pedro@gmail.com"}, 'user', '987654321', 'tiago@gmail.com');

    var splab = {
            name: 'SPLAB',
            key: '987654321',
            sent_invitations: [invite]  ,
            members: [tiago]
    };

    var tiago = {
        name: 'Tiago',
        email: 'tiago@gmail.com',
        institutions: splab.key,
        follows: splab.key,
        invites:[]
    };

    beforeEach(module('app'));

    beforeEach(inject(function($controller, $httpBackend, $rootScope, $state, InviteService, AuthService, InstitutionService) {
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        state = $state;
        inviteService = InviteService;
        httpBackend.when('GET', INSTITUTIONS_URI + splab.key).respond(splab);
        httpBackend.when('GET', INSTITUTIONS_URI + splab.key + '/members').respond([tiago]);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
        httpBackend.when('GET', 'auth/login.html').respond(200);
        createCtrl = function() {
            return $controller('InviteUserController',
                {
                    scope: scope,
                    inviteService: InviteService,
                    institutionService: InstitutionService
                });
        };
        state.params.institutionKey = splab.key;
        inviteUserCtrl = createCtrl();
        httpBackend.flush();
    }));

    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    describe('InviteUserController properties', function() {

        it('should exist one sent sent invitations', function() {
            expect(inviteUserCtrl.sent_invitations).toEqual([invite]);
            expect(inviteUserCtrl.sent_invitations.length).toBe(1);
        });
    });

    describe('InviteUserController functions', function() {

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
                inviteUserCtrl.invite.invitee = "pedro@gmail.com";
                expect(inviteUserCtrl.sent_invitations.length).toBe(1);
                var promise = inviteUserCtrl.sendUserInvite();
                promise.then(function() {
                    expect(inviteService.sendInvite).toHaveBeenCalledWith(otherInvite);
                    expect(inviteUserCtrl.invite).toEqual({});
                    expect(inviteUserCtrl.sent_invitations).toContain(invite);
                    expect(inviteUserCtrl.sent_invitations).toContain(otherInvite);
                    expect(inviteUserCtrl.sent_invitations.length).toBe(2);
                    done();
                });
                scope.$apply();
            });
        });

        describe('isUserInviteValid()', function() {
            
            it('should be true with new invite', function() {
                var newInvite = new Invite({invitee: "pedro@gmail.com"}, 'user', '987654321', 'tiago@gmail.com');
                expect(inviteUserCtrl.isUserInviteValid(newInvite)).toBe(true);
            });

            it('should be false when the invitee was already invited', function() {
                var inviteInvited = new Invite({invitee: "mayzabeel@gmail.com"}, 'user', '987654321', 'tiago@gmail.com');
                expect(inviteUserCtrl.isUserInviteValid(inviteInvited)).toBe(false);
            });

            it('should be false when the invitee was already member', function() {
                var inviteMember = new Invite({invitee: "tiago@gmail.com"}, 'user', '987654321', 'tiago@gmail.com');
                expect(inviteUserCtrl.isUserInviteValid(inviteMember)).toBe(false);
            });
        });
    });
}));