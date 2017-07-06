'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstController", function InviteInstController(InviteInstService,$mdToast, $state, AuthService) {
        var inviteInstCtrl = this;

        inviteInstCtrl.invite = {};

        var currentInstitutionKey = $state.params.institutionKey;

        Object.defineProperty(inviteInstCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        inviteInstCtrl.cancelInvite = function cancelInvite() {
            $state.go("app.home");
        };

        inviteInstCtrl.sendInstInvite = function sendInvite() {
            var invite = new Invite(inviteInstCtrl.invite, 'institution');
            if (invite.isValid()) {
                InviteInstService.sendInstInvite(invite).then(function success(response) {
                    showToast('Convite enviado com sucesso!');
                    $state.go("app.home");
                }, function error(response) {
                    showToast(response.data.msg);
                });
            } else {
                showToast('Convite inválido!');
            }
        };

        inviteInstCtrl.sendUserInvite = function sendInvite() {
            var invite = new Invite(inviteInstCtrl.invite, 'user');
            invite.institution_key = currentInstitutionKey;
            if (invite.isValid()) {
                InviteInstService.sendInstInvite(invite).then(function success(response) {
                    showToast('Convite enviado com sucesso!');
                    $state.go('app.institution', {institutionKey: currentInstitutionKey});
                }, function error(response) {
                    showToast(response.data.msg);
                });
            } else {
                showToast('Convite inválido!');
            }
        };

        inviteInstCtrl.cancelUserInvite = function cancelInvite() {
           $state.go('app.institution', {institutionKey: currentInstitutionKey});
        };

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