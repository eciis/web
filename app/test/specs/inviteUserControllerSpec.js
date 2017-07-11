'use strict';

(describe('Test InviteUserController', function() {

    var inviteUserCtrl, httpBackend, scope, inviteService, createCtrl, state;

    var splab = {
            name: 'SPLAB',
            key: '987654321' 
    };

    var tiago = {
        name: 'Tiago',
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
        httpBackend.expect('GET', '/api/user').respond(tiago);
        httpBackend.when('GET', 'institution/institution_page.html').respond(200);
        httpBackend.when('GET', "main/main.html").respond(200);
        httpBackend.when('GET', "home/home.html").respond(200);
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
                inviteUserCtrl.invite = {institution_key: splab.key, type_of_invite: "user", invitee: "mayzabeel@gmail.com"};
                var invite = new Invite(inviteUserCtrl.invite, 'user', inviteUserCtrl.invite.institution_key);
                var promise = inviteUserCtrl.sendUserInvite();
                promise.then(function() {
                    expect(inviteService.sendInvite).toHaveBeenCalledWith(invite);
                    expect(inviteUserCtrl.invite).toEqual({});
                    expect(inviteUserCtrl.sent_invitations).toContain({institution_key: splab.key, type_of_invite: "user", invitee: "mayzabeel@gmail.com"});
                    done();
                });
                scope.$apply();
            });
        });
    });
}));