'use strict';
(function() {
    var app = angular.module('app');

    app.controller("DialogController", DialogController);

    app.controller("InviteInstitutionController", function InviteInstitutionController(
        InviteService, $mdToast, $state, AuthService, InstitutionService, $mdDialog, MessageService) {
        var inviteController = this;

        inviteController.invite = {};
        inviteController.sent_invitations = [];
        inviteController.existing_institutions = [];
        var INSTITUTION_STATE = "active,pending";

        var invite;

        inviteController.user = AuthService.getCurrentUser();

        inviteController.cancelInvite = function cancelInvite() {
            $state.go("app.home");
        };

        inviteController.checkInstInvite = function checkInstInvite(ev) {
            var promise;
            var currentInstitutionKey = inviteController.user.current_institution.key;
            invite = new Invite(inviteController.invite, 'INSTITUTION',
                currentInstitutionKey, inviteController.user.email);
            if (!invite.isValid()) {
                MessageService.showToast('Convite inválido!');
            } else {
                var suggestionInstName = inviteController.invite.suggestion_institution_name;
                promise = InstitutionService.searchInstitutions(suggestionInstName, INSTITUTION_STATE);
                promise.then(function success(response) {
                    inviteController.showDialogOrSendInvite(response.data, ev);
                });
                return promise;
            }
        };

        inviteController.showDialogOrSendInvite = function showDialogOrSendInvite(data, ev) {
            inviteController.existing_institutions = data;
            if(_.isEmpty(inviteController.existing_institutions)) {
                inviteController.sendInstInvite(invite);
            } else {
                inviteController.showDialog(ev, invite);
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
                    MessageService.showToast('Convite enviado com sucesso!');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
            return promise;
        };

        function loadSentInvitations() {
            InviteService.getSentInstitutionInvitations().then(function success(response) {
                inviteController.sent_invitations = response.data;
            }, function error(response) {
                $state.go('app.home');
                MessageService.showToast(response.data.msg);
            });
        }

        loadSentInvitations();
    });

    function DialogController($mdDialog, institutions, invite, inviteController, $state) {
        var dialogCtrl = this;
        dialogCtrl.institutions = institutions;
        dialogCtrl.invite = invite;

        var ACTIVE_STATE = "active";

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
            return state === ACTIVE_STATE;
        };
    }
})();