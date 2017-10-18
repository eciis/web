'use strict';
(function() {
    var app = angular.module('app');

    app.controller("ManagementMembersController", function InviteUserController(
        InviteService, $mdToast, $state, $mdDialog, InstitutionService, AuthService, MessageService,
        RequestInvitationService, ProfileService) {
        var manageMemberCtrl = this;

        manageMemberCtrl.invite = {};
        manageMemberCtrl.sent_invitations = [];

        manageMemberCtrl.showButton = true;
        var currentInstitutionKey = $state.params.institutionKey;
        var invite;

        manageMemberCtrl.user = AuthService.getCurrentUser();

        manageMemberCtrl.removeMember = function removeMember(ev, member_obj) {
            var title = 'Remover Membro';
            var text= "Você deseja remover esse membro?";
            var dialog = MessageService.showConfirmationDialog(ev, title, text);

            dialog.then(function() {
                InstitutionService.removeMember(currentInstitutionKey, member_obj).then(function success() {
                    MessageService.showToast("Membro removido com sucesso.");
                    _.remove(manageMemberCtrl.members, function(member) {
                        return member.key === member_obj.key;
                    });
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };

        manageMemberCtrl.showUserProfile = function showUserProfile(userKey, ev) {
            ProfileService.showProfile(userKey, ev);
        };

        manageMemberCtrl.sendUserInvite = function sendInvite() {
            manageMemberCtrl.invite.institution_key = currentInstitutionKey;
            manageMemberCtrl.invite.admin_key = manageMemberCtrl.user.key;
            manageMemberCtrl.invite.type_of_invite = 'USER';
            invite = new Invite(manageMemberCtrl.invite);

            if (manageMemberCtrl.isUserInviteValid(invite)) {
                var promise = InviteService.sendInvite(invite);
                promise.then(function success() {
                    manageMemberCtrl.sent_invitations.push(invite);
                    manageMemberCtrl.invite = {};
                    manageMemberCtrl.showButton = true;
                    MessageService.showToast('Convite enviado com sucesso!');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
                return promise;
            }
        };

        manageMemberCtrl.acceptRequest = function acceptRequest(request) {
            var promise = RequestInvitationService.acceptRequest(request.key);

            promise.then(function success(response) {
                manageMemberCtrl.members.push(response);
                request.status = 'accepted';
                MessageService.showToast("Pedido aceito!");
            });
            return promise;
        };

        manageMemberCtrl.rejectRequest = function rejectInvite(request, event){
                var promise = RequestInvitationService.showRejectDialog(event);
                promise.then(function() {
                    deleteRequest(request);
                }, function() {
                    MessageService.showToast('Rejeição de pedido cancelada!');
                });
                return promise;
        };

        function deleteRequest(request) {
            var promise = RequestInvitationService.rejectRequest(request.key);
            promise.then(function success() {
                request.status = 'rejected';
                MessageService.showToast("O pedido foi rejeitado!");
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }

        manageMemberCtrl.cancelInvite = function cancelInvite() {
            manageMemberCtrl.invite = {};
            manageMemberCtrl.showButton = true;
        };

        manageMemberCtrl.isAdmin = function isAdmin(member) {
            return member.key === manageMemberCtrl.user.key;
        };

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                manageMemberCtrl.sent_invitations = response.data.sent_invitations;
                getMembers();
                getRequests();
            }, function error(response) {
                $state.go('app.institution', {institutionKey: currentInstitutionKey});
                MessageService.showToast(response.data.msg);
            });
        }

        function getMembers() {
            InstitutionService.getMembers(currentInstitutionKey).then(function success(response) {
                manageMemberCtrl.members = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        function getRequests() {
            RequestInvitationService.getRequests(currentInstitutionKey).then(function success(response) {
                manageMemberCtrl.requests = response;
            });
        }

        function getEmail(user) {
            return user.email;
        }

        function inviteeIsMember(invite) {
            return _.find(_.map(manageMemberCtrl.members, getEmail), function(emails) {
                return _.includes(emails, invite.invitee);
            });
        }

        function inviteeIsInvited(invite) {
            return _.find(manageMemberCtrl.sent_invitations, function(sentInvitation) {
                return sentInvitation.invitee === invite.invitee;
            });
        }

        manageMemberCtrl.isUserInviteValid = function isUserInviteValid(invite) {
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