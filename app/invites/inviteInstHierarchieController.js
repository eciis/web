'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstHierarchieController", function InviteInstHierarchieController(
        InviteService,$mdToast, $mdDialog, $state, AuthService, InstitutionService, MessageService) {
        var inviteInstCtrl = this;

        inviteInstCtrl.user = AuthService.getCurrentUser();
        inviteInstCtrl.institution = {};

        inviteInstCtrl.invite = {};
        inviteInstCtrl.type_of_invite = '';

        inviteInstCtrl.hasParent = false;
        inviteInstCtrl.showButton = true;

        var currentInstitutionKey = $state.params.institutionKey;

        var invite;

        inviteInstCtrl.sendInstInvite = function sendInstInvite() {
            var currentInstitutionKey = inviteInstCtrl.user.current_institution.key;
            invite = new Invite(inviteInstCtrl.invite, inviteInstCtrl.type_of_invite, 
                currentInstitutionKey, inviteInstCtrl.user.email);

            if (!invite.isValid()) {
                MessageService.showToast('Convite inválido!');
            } else {                
                var promise = InviteService.sendInvite(invite);
                promise.then(function success() {
                    MessageService.showToast('Convite enviado com sucesso!');
                    addInvite(invite);
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
                return promise;
            }
        };

        inviteInstCtrl.createParentInstInvite = function createParentInstInvite(){
            if(inviteInstCtrl.hasParent){
                MessageService.showToast("Já possue instituição superior");
            } else {
                inviteInstCtrl.type_of_invite = 'institution_parent';
                inviteInstCtrl.showButton = false;
            }            
        };

        inviteInstCtrl.cancelInvite = function cancelInvite() {
            inviteInstCtrl.invite = {};
            inviteInstCtrl.showButton = true;
        };

        inviteInstCtrl.goToInst = function goToInst(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        inviteInstCtrl.isActive = function isActive(institution) {
            return institution.state == 'active';
        };

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                inviteInstCtrl.institution = new Institution(response.data);
                inviteInstCtrl.hasParent = !_.isEmpty(inviteInstCtrl.institution.parent_institution);
            }, function error(response) {
                $state.go('app.institution', {institutionKey: currentInstitutionKey});
                MessageService.showToast(response.data.msg);
            });
        }

        function addInvite(invite) {
            inviteInstCtrl.invite = {};
            inviteInstCtrl.institution.addInvite(invite);
            var stub = inviteInstCtrl.institution.createStub(invite);

            if (invite.type_of_invite == 'institution_parent'){
                inviteInstCtrl.institution.addParentInst(stub);
                inviteInstCtrl.hasParent = true;
            }
            inviteInstCtrl.type_of_invite = '';
            inviteInstCtrl.showButton = true;
        }

        loadInstitution();
    });
})();