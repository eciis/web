'use strict';
(function() {
    var app = angular.module('app');

    app.controller("SuggestInstitutionController", function SuggestInstitutionController(
        $mdDialog, institutions, invite, inviteController, $state){
        var suggestInstCtrl = this;
        suggestInstCtrl.institutions = institutions;
        suggestInstCtrl.invite = invite;

        var ACTIVE_STATE = "active";

        suggestInstCtrl.sendInvite = function sendInvite(){
            inviteController.sendInstInvite(invite);
            suggestInstCtrl.cancel();
        };

        suggestInstCtrl.goToInstitution = function goToInstitution(institutionKey) {
            var url = makeUrl(institutionKey);
            window.open(url,'_blank');
            suggestInstCtrl.cancel();
        };

        suggestInstCtrl.cancel = function cancel() {
            $mdDialog.cancel();
        };

        suggestInstCtrl.isActive = function(state) {
            return state === ACTIVE_STATE;
        };

        function makeUrl(institutionKey){
            var url_atual = window.location.href;
            url_atual = url_atual.split('#');
            return url_atual[0] + $state.href('app.institution', {institutionKey: institutionKey});
        }
    });
})();