'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstHierarchieController", function InviteInstHierarchieController(
        InviteService,$mdToast, $state, AuthService, InstitutionService) {
        var inviteInstCtrl = this;

        inviteInstCtrl.invite = {};
        inviteInstCtrl.type_of_invite = '';
        inviteInstCtrl.sent_invitations = [];

        inviteInstCtrl.institution_parent = {};
        inviteInstCtrl.institution_children = [];

        var invite;

        Object.defineProperty(inviteInstCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        inviteInstCtrl.sendInstInvite = function sendInvite() {
            var currentInstitutionKey = inviteInstCtrl.user.current_institution.key;
            invite = new Invite(inviteInstCtrl.invite, inviteInstCtrl.type_of_invite, currentInstitutionKey);
            if (!invite.isValid()) {
                showToast('Convite inválido!');
            } else {                
                var promise = InviteService.sendInvite(invite);
                promise.then(function success(response) {
                    showToast('Convite enviado com sucesso!');
                    inviteInstCtrl.sent_invitations.push(response.data);
                }, function error(response) {
                    showToast(response.data.msg);
                });
                return promise;
            }
        };

        inviteInstCtrl.createParentInstInvite = function createParentInstInvite(){
            inviteInstCtrl.type_of_invite = 'institution_parent';
        };

        function loadInstitution() {
            InstitutionService.getInstitution(currentInstitutionKey).then(function success(response) {
                inviteController.sent_invitations = response.data.sent_invitations;
                inviteInstCtrl.institution_parent = response.data.parent_institution;
                inviteInstCtrl.institution_parent = response.data.children_institutions;

                console.log(response.data);


            }, function error(response) {
                $state.go('app.institution', {institutionKey: currentInstitutionKey});
                showToast(response.data.msg);
            });
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
    });
})();