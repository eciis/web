'use strict';

(function () {
    const app = angular.module("app");

    app.controller('TransferAdminController', function (institution_members, institution, InviteService, MessageService, $mdDialog) {
        var transferAdminCtrl = this;
        transferAdminCtrl.institution_members = institution_members;
        transferAdminCtrl.member = null;
        transferAdminCtrl.selectedMember = null;

        transferAdminCtrl.searchMember = function searchMember(member) {
            if (transferAdminCtrl.member) {
                var foundMemberByEmail = _.find(member.email, function (email) {
                    return email.includes(transferAdminCtrl.member);
                });

                return foundMemberByEmail || member.name.includes(transferAdminCtrl.member);
            }
            return false;
        };

        transferAdminCtrl.selectMember = function selectMember(member) {
            transferAdminCtrl.selectedMember = member;
            transferAdminCtrl.member = member.email[0];
        };

        transferAdminCtrl.cancel = function cancel() {
            $mdDialog.cancel();
        };

        transferAdminCtrl.confirm = function confirm() {
            if (transferAdminCtrl.selectedMember) {
                if (transferAdminCtrl.selectedMember.key !== institution.admin.key) {
                    let data = {
                        institution_key: institution.key,
                        admin_key: institution.admin.key,
                        type_of_invite: 'USER_ADM',
                        sender_name: institution.admin.name,
                        invitee_key: transferAdminCtrl.selectedMember.key,
                        invitee: transferAdminCtrl.selectedMember.email[0]
                    };

                    let invite = new Invite(data);

                    InviteService.sendInviteUser({invite_body: invite}).then(function success(response) {
                        invite.status = 'sent';
                        $mdDialog.hide(invite);
                        MessageService.showToast("Convite enviado com sucesso!");
                    }, function error(response) {
                        MessageService.showToast(response.data);
                    });
                } else {
                    MessageService.showToast('Você já é administrador da instituição, selecione outro membro!');
                }
            } else {
                MessageService.showToast('Selecione um memebro!');
            }
        };
    });
})();