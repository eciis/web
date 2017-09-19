'use strict';
(function() {
    var app = angular.module('app');

    app.controller("SuggestInstitutionController", function SuggestInstitutionController(
        $mdDialog, institution, institutions, invite, inviteController, $state, MessageService, InstitutionService){
        var suggestInstCtrl = this;
        suggestInstCtrl.institution = institution;
        suggestInstCtrl.institutions = institutions;
        suggestInstCtrl.invite = invite;
        suggestInstCtrl.chosen_institution = null;
        var ACTIVE_STATE = "active";

        suggestInstCtrl.goToInstitution = function goToInstitution(institutionKey) {
            window.open(makeUrl(institutionKey), '_blank');
            suggestInstCtrl.cancel();
        };

        suggestInstCtrl.cancel = function cancel() {
            $mdDialog.cancel();
        };

        suggestInstCtrl.isActive = function(state) {
            return state === ACTIVE_STATE;
        };

        function makeUrl(institutionKey){
            var currentUrl = window.location.href;
            currentUrl = currentUrl.split('#');
            return currentUrl[0] + $state.href('app.institution', {institutionKey: institutionKey});
        }

        suggestInstCtrl.checkInvite = function checkInvite() {
            if (suggestInstCtrl.chosen_institution) {
                InstitutionService.getInstitution(suggestInstCtrl.chosen_institution).then(function(response) {
                    if (!(hasParent(response.data) || isLinked() || isRequested() || isSelf())) {
                        inviteController.sendInviteToExistingInst(invite, suggestInstCtrl.chosen_institution);
                        suggestInstCtrl.cancel();
                    }
                });
            } else {
                inviteController.sendInstInvite(invite);
                suggestInstCtrl.cancel();
            }
        };

        function hasParent(requested_institution) {
            if (suggestInstCtrl.invite.type_of_invite === "REQUEST_INSTITUTION_CHILDREN" && requested_institution.parent_institution !== null) {
                MessageService.showToast('A instituição convidada já possui instituição superior');
                return true;
            }
            return false;
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

        function isSelf() {
            if (suggestInstCtrl.institution.key === suggestInstCtrl.chosen_institution) {
                MessageService.showToast('A instituição convidada não pode ser ela mesma');
                return true;
            }
            return false;
        }

        function getKeyFromInst(institution) {
            return institution.key;
        }
    });
})();