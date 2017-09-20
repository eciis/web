'use strict';
(function() {
    var app = angular.module('app');

    app.controller("SuggestInstitutionController", function SuggestInstitutionController(
        $mdDialog, institution, institutions, invite, requested_invites, isHierarchy, inviteController, $state,
        MessageService){
        var suggestInstCtrl = this;
        suggestInstCtrl.institution = institution;
        suggestInstCtrl.institutions = institutions;
        suggestInstCtrl.invite = invite;
        suggestInstCtrl.chosen_institution = null;
        suggestInstCtrl.requested_invites = requested_invites;
        suggestInstCtrl.isHierarchy = isHierarchy;
        var ACTIVE_STATE = "active";

        suggestInstCtrl.goToInstitution = function goToInstitution(institutionKey) {
            window.open(makeUrl(institutionKey), '_blank');
            suggestInstCtrl.cancel();
        };

        suggestInstCtrl.cancel = function cancel() {
            $mdDialog.cancel();
        };

        suggestInstCtrl.showSuggestion = function(state) {
            var isActive = state === ACTIVE_STATE;
            return isActive && suggestInstCtrl.isHierarchy;
        };

        suggestInstCtrl.isActive = function(state) {
            return state === ACTIVE_STATE;
        };

        function makeUrl(institutionKey){
            var currentUrl = window.location.href;
            currentUrl = currentUrl.split('#');
            return currentUrl[0] + $state.href('app.institution', {institutionKey: institutionKey});
        }

        suggestInstCtrl.checkAndSendInvite = function checkAndSendInvite() {
            if (suggestInstCtrl.chosen_institution) {
                sendInviteToExistingInst();
            } else {
                inviteController.sendInstInvite(invite).then(function() {
                    suggestInstCtrl.cancel();
                });
            }
        };

        function sendInviteToExistingInst() {
            if (!(isLinked() || isSelf() || isPedingRequest() || isInvited())) {
                inviteController.sendInviteToExistingInst(invite, suggestInstCtrl.chosen_institution).then(function() {
                    suggestInstCtrl.cancel();
                });
            }
        }

        function isLinked() {
            var isParent = _.includes(_.map(suggestInstCtrl.institution.children_institutions, getKeyFromInst), suggestInstCtrl.chosen_institution);
            var isChildren = (suggestInstCtrl.institution.parent_institution !== null &&
                    suggestInstCtrl.institution.parent_institution.key === suggestInstCtrl.chosen_institution);
            if (isParent || isChildren) {
                MessageService.showToast('As instituições já estão conectadas');
                return true;
            }
            return false;
        }

        function isPedingRequest() {
            if (_.includes(_.map(suggestInstCtrl.requested_invites, getInstKeyFromInvite), suggestInstCtrl.chosen_institution)) {
                MessageService.showToast('Esta instituição tem uma requisição de vínculo pendente. Aceite ou rejeite a requisição');
                return true;
            }
            return false;
        }

        function isSelf() {
            if (suggestInstCtrl.institution.key === suggestInstCtrl.chosen_institution) {
                MessageService.showToast('A instituição convidada não pode ser ela mesma');
                return true;
            }
            return false;
        }

        function isInvited() {
            var result = false;
            _.forEach(suggestInstCtrl.institution.sent_invitations, function(invite) {
                if ((invite.type_of_invite === "REQUEST_INSTITUTION_PARENT" || invite.type_of_invite === "REQUEST_INSTITUTION_CHILDREN") &&
                    invite.institution_requested_key === suggestInstCtrl.chosen_institution && invite.status === "sent") {
                    MessageService.showToast('Esta instituição já foi convidada e seu convite está pendente');
                    result = true;
                }
            });
            return result;
        }

        function getKeyFromInst(institution) {
            return institution.key;
        }

        function getInstKeyFromInvite(invite) {
            return invite.institution_key;
        }
    });
})();