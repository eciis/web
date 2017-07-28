'use strict';
(function() {
    var app = angular.module('app');

    app.controller("DialogController", DialogController);

    app.controller("InviteInstitutionController", function InviteInstitutionController(
        InviteService, $mdToast, $state, AuthService, InstitutionService, $mdDialog) {
        var inviteController = this;

        inviteController.invite = {};
        inviteController.sent_invitations = [];
        inviteController.existing_institutions = [];

        var invite;

        inviteController.user = AuthService.getCurrentUser();

        inviteController.cancelInvite = function cancelInvite() {
            $state.go("app.home");
        };

        inviteController.checkInstInvite = function checkInstInvite(ev) {
            var promise;
            var currentInstitutionKey = inviteController.user.current_institution.key;
            invite = new Invite(inviteController.invite, 'institution', currentInstitutionKey, inviteController.user.email);
            if (!invite.isValid()) {
                showToast('Convite inválido!');
            } else {
                promise = InstitutionService.searchInstitutions(inviteController.invite.suggestion_institution_name, "(active OR pending)");
                promise.then(function success(response) {
                        inviteController.existing_institutions = response.data;
                        if(_.size(inviteController.existing_institutions) === 0) {
                            inviteController.sendInstInvite(invite);
                        }
                        else{
                            inviteController.showDialog(ev, invite);
                        }
                    });
                return promise;
            }
        };

        inviteController.showDialog = function showDialog(ev, invite) {
            $mdDialog.show({
                locals: {
                    'institutions': inviteController.existing_institutions,
                    'invite': invite,
                    'inviteController': inviteController
                },
                controller: DialogController,
                controllerAs: 'dialogCtrl',
                templateUrl: 'invites/existing_institutions.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        inviteController.sendInstInvite = function sendInstInvite(invite) {
            var promise = InviteService.sendInvite(invite);
            promise.then(function success(response) {
                    inviteController.sent_invitations.push(invite);
                    showToast('Convite enviado com sucesso!');
                }, function error(response) {
                    showToast(response.data.msg);
                });
            return promise;
        };

        function showToast(msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        }

        function loadSentInvitations() {
            InviteService.getSentInstitutionInvitations().then(function success(response) {
                inviteController.sent_invitations = response.data;
            }, function error(response) {
                $state.go('app.home');
                showToast(response.data.msg);
            });
        }

        loadSentInvitations();
    });

    function DialogController($mdDialog, institutions, invite, inviteController, $state) {
        var dialogCtrl = this;
        dialogCtrl.institutions = institutions;
        dialogCtrl.invite = invite;

        dialogCtrl.sendInvite = function sendInvite(){
            inviteController.sendInstInvite(invite);
            dialogCtrl.cancel();
        };

        dialogCtrl.goToInstitution = function goToInstitution(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
            dialogCtrl.cancel();
        };

        dialogCtrl.cancel = function cancel() {
            $mdDialog.cancel();
        };

        dialogCtrl.isActive = function(state) {
            return state === 'active';
        };
    }
})();