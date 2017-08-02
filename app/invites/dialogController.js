'use strict';
(function() {
    var app = angular.module('app');

    app.controller("DialogController", function DialogController($mdDialog, institutions, invite, inviteController, $state){
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

    });
})();