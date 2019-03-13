'use strict';

(describe('Test TransferAdminController', function() {
    beforeEach(module('app'));
    var user = {
        name: 'name',
        current_institution: {key: "institutuion_key"},
        email: ['user@email.com'],
        state: 'active',
        key: '3242343rdsf324s'
    };

    var otherUser = {
        name: 'other',
        email: ['other@email.com'],
        state: 'active',
        key: 'eioruwiour83748932749'
    };

    var institution = {
        key: "institutuion_key",
        admin: user,
        members: [user, otherUser]
    };

    var transferAdminCtrl, inviteService, messageService, mdDialog, scope;

    beforeEach(inject(function($controller, MessageService, InviteService, $rootScope, $mdDialog, AuthService) {
        inviteService = InviteService;
        messageService = MessageService;
        mdDialog = $mdDialog;
        scope = $rootScope;

        AuthService.login(user);

        transferAdminCtrl = $controller('TransferAdminController', {
            institution_members: institution.members,
            institution: institution,
            InviteService: inviteService,
            MessageService: messageService,
            $mdDialog: mdDialog
        });
    }));

    describe('Test searchMember()', function() {

        it('Should return true because the user was found.', function() {
            transferAdminCtrl.member = user.name;
            expect(transferAdminCtrl.searchMember(user)).toBeTruthy();
            transferAdminCtrl.member = user.email[0];
            expect(transferAdminCtrl.searchMember(user)).toBeTruthy();
        });

        it("Should return false because the user wasn't found.", function() {
            transferAdminCtrl.member = user.name;
            expect(transferAdminCtrl.searchMember(otherUser)).toBeFalsy();
            transferAdminCtrl.member = user.email[0];
            expect(transferAdminCtrl.searchMember(otherUser)).toBeFalsy();
        });
    });

    describe('Test selectMember()', function() {

        it('Should must select the user passed as a parameter', function() {
            transferAdminCtrl.selectMember(user);
            expect(transferAdminCtrl.selectedMember).toEqual(user);
            expect(transferAdminCtrl.member).toEqual(user.email[0]);

            transferAdminCtrl.selectMember(otherUser);
            expect(transferAdminCtrl.selectedMember).toEqual(otherUser);
            expect(transferAdminCtrl.member).toEqual(otherUser.email[0]);
        });
    });

    describe('Test confirm()', function() {
        beforeEach(function() {
            spyOn(inviteService, 'sendInviteUser').and.callFake(function() {
                return {
                    then: function(calback) {
                        calback();
                    }
                };
            });

            spyOn(mdDialog, 'hide').and.callFake(function() {});
            spyOn(messageService, 'showErrorToast').and.callFake(function() {});
            spyOn(messageService, 'showInfoToast').and.callFake(function() {});
        });

        it('Should not send the invitation.', function() {

            let data = {
                institution_key: institution.key,
                admin_key: institution.admin.key,
                type_of_invite: 'USER_ADM',
                sender_name: institution.admin.name,
                invitee_key: user.key,
                invitee: user.email[0]
            };

            let invite = new Invite(data);
            invite.status = 'sent';

            transferAdminCtrl.selectMember(user);
            transferAdminCtrl.confirm();

            expect(messageService.showErrorToast).toHaveBeenCalledWith("Você já é administrador da instituição, selecione outro membro!");
        });

        it('Should must send the invitation.', function() {

            let data = {
                institution_key: institution.key,
                admin_key: institution.admin.key,
                type_of_invite: 'USER_ADM',
                sender_name: institution.admin.name,
                invitee_key: otherUser.key,
                invitee: otherUser.email[0]
            };

            let invite = new Invite(data);
            invite.status = 'sent';

            transferAdminCtrl.selectMember(otherUser);
            transferAdminCtrl.confirm();

            expect(inviteService.sendInviteUser).toHaveBeenCalledWith({invite_body: invite});
            expect(mdDialog.hide).toHaveBeenCalledWith(invite);
            expect(messageService.showInfoToast).toHaveBeenCalledWith("Convite enviado com sucesso!");
        });

        it('Should not be sent if there is no member selected.', function() {
            transferAdminCtrl.confirm();
            expect(inviteService.sendInviteUser).not.toHaveBeenCalled();
            expect(mdDialog.hide).not.toHaveBeenCalled();
            expect(messageService.showErrorToast).toHaveBeenCalledWith("Selecione um memebro!");
        });
    });
}));