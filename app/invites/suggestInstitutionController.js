'use strict';
(function() {
    var app = angular.module('app');

    app.controller("SuggestInstitutionController", function SuggestInstitutionController(
        $mdDialog, institutions, invite, inviteController, $state){
        var suggestInstCtrl = this;
        suggestInstCtrl.institutions = institutions;
        suggestInstCtrl.invite = invite;
        suggestInstCtrl.chosen_institution = null;

        var ACTIVE_STATE = "active";

        suggestInstCtrl.sendInvite = function sendInvite(){
            if(suggestInstCtrl.chosen_institution) {
                inviteController.sendInviteToExistingInst(invite, suggestInstCtrl.chosen_institution);
            } else {
                inviteController.sendInstInvite(invite);
            }
            suggestInstCtrl.cancel();
        };

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
    });
})();