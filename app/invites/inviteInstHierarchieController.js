'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstHierarchieController", function InviteInstHierarchieController(
        InviteService,$mdToast, $mdDialog, $state, AuthService, InstitutionService) {
        var inviteInstCtrl = this;

        inviteInstCtrl.invite = {};
        inviteInstCtrl.type_of_invite = '';
        inviteInstCtrl.sent_invitations = [];

        inviteInstCtrl.institution_parent = {};
        inviteInstCtrl.institution_children = [];

        inviteInstCtrl.hasParent = false;
        inviteInstCtrl.showButton = true;

        var currentInstitutionKey = $state.params.institutionKey;

        var invite;

        Object.defineProperty(inviteInstCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        inviteInstCtrl.sendInstInvite = function sendInstInvite() {
            var currentInstitutionKey = inviteInstCtrl.user.current_institution.key;
            invite = new Invite(inviteInstCtrl.invite, inviteInstCtrl.type_of_invite, currentInstitutionKey);
            if (!invite.isValid()) {
                showToast('Convite inválido!');
            } else {                
                var promise = InviteService.sendInvite(invite);
                promise.then(function success(response) {
                    showToast('Convite enviado com sucesso!');
                    inviteInstCtrl.invite = {};
                    inviteInstCtrl.sent_invitations.push(response.data);
                    inviteInstCtrl.institution_parent = {
                        'name': response.data.suggestion_institution_name,
                        'state': 'pending'
                    };
                    inviteInstCtrl.hasParent = true;
                }, function error(response) {
                    showToast(response.data.msg);
                });
                return promise;
            }
        };

        inviteInstCtrl.createParentInstInvite = function createParentInstInvite(){
            inviteInstCtrl.type_of_invite = 'institution_parent';
            inviteInstCtrl.showButton = false;
        };

        inviteInstCtrl.cancelInvite = function cancelInvite() {
            inviteInstCtrl.invite = {};
            inviteInstCtrl.showButton = true;
        };

        inviteInstCtrl.goToInst = function goToInst(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        inviteInstCtrl.showLink = function showLink(institution) {
            return institution.state == 'active';
        };

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                inviteInstCtrl.sent_invitations = response.data.sent_invitations;
                getParentInstitution(response.data);

            }, function error(response) {
                $state.go('app.institution', {institutionKey: currentInstitutionKey});
                showToast(response.data.msg);
            });
        }

        function getParentInstitution(institution) {
            if(institution.parent_institution !== null){
                InstitutionService.getInstitution(institution.parent_institution).then(function success(response) {
                    inviteInstCtrl.hasParent = true;
                    inviteInstCtrl.institution_parent = response.data;                   

                }, function error(response) {
                    $state.go('app.institution', {institutionKey: currentInstitutionKey});
                    showToast(response.data.msg);
                });
            }
        }        

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

        loadInstitution();
    });
})();