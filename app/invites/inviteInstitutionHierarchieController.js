'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstHierarchieController", function InviteInstitutionController(
        InviteService,$mdToast, $state, AuthService) {
        var inviteController = this;

        inviteController.invite = {};
        inviteController.type_of_invite = '';

        var invite;

        Object.defineProperty(inviteController, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        inviteController.sendInstInvite = function sendInvite() {
            var currentInstitutionKey = inviteController.user.current_institution.key;
            invite = new Invite(inviteController.invite, inviteController.type_of_invite, currentInstitutionKey);
            if (!invite.isValid()) {
                showToast('Convite inválido!');
            } else {
                console.log("É VALIDO");

                
                var promise = InviteService.sendInvite(invite);
                promise.then(function success(response) {
                    showToast('Convite enviado com sucesso!');
                    $state.go("app.home");
                }, function error(response) {
                    showToast(response.data.msg);
                });
                return promise;
            }
        };

        inviteController.createParentInstInvite = function createParentInstInvite(){
            inviteController.type_of_invite = 'institution_parent';
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