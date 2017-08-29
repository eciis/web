'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteUserController", function InviteUserController(
        InviteService, $mdToast, $state, InstitutionService, AuthService, MessageService) {
        var inviteController = this;

        inviteController.invite = {};
        inviteController.sent_invitations = [];

        inviteController.showButton = true;
        var currentInstitutionKey = $state.params.institutionKey;
        var invite;

        inviteController.user = AuthService.getCurrentUser();

        inviteController.sendUserInvite = function sendInvite() {
            inviteController.invite.institution_key = currentInstitutionKey;
            inviteController.invite.inviter_key = inviteController.user.key;
            inviteController.invite.type_of_invite = 'USER';
            invite = new Invite(inviteController.invite);

            if (inviteController.isUserInviteValid(invite)) {
                var promise = InviteService.sendInvite(invite);
                promise.then(function success(response) {
                    inviteController.sent_invitations.push(invite);
                    inviteController.invite = {};
                    inviteController.showButton = true;
                    MessageService.showToast('Convite enviado com sucesso!');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
                return promise;
            }
        };

        inviteController.cancelInvite = function cancelInvite() {
            inviteController.invite = {};
            inviteController.showButton = true;
        };

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                inviteController.sent_invitations = response.data.sent_invitations;
                getMembers();
            }, function error(response) {
                $state.go('app.institution', {institutionKey: currentInstitutionKey});
                MessageService.showToast(response.data.msg);
            });
        }

        function getMembers() {
            InstitutionService.getMembers(currentInstitutionKey).then(function success(response) {
                inviteController.members = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        function getEmail(user) {
            return user.email;
        }

        function inviteeIsMember(invite) {
            return _.includes(_.map(inviteController.members, getEmail), invite.invitee);
        }

        function inviteeIsInvited(invite) {
            return _.some(inviteController.sent_invitations, invite);
        }

        inviteController.isUserInviteValid = function isUserInviteValid(invite) {
            var isValid = true;
            if (! invite.isValid()) {
                isValid = false;
                MessageService.showToast('Convite inválido!');
            } else if (inviteeIsMember(invite)) {
                isValid = false;
                MessageService.showToast('O convidado já é um membro!');
            } else if (inviteeIsInvited(invite)) {
                isValid = false;
                MessageService.showToast('Este email já foi convidado');
            }
            return isValid;
        };

        loadInstitution();
    });
})();