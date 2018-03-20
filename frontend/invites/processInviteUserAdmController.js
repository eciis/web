'use strict';

(function() {
    var app = angular.module('app');

    app.controller('ProcessInviteUserAdmController', function ProcessInviteUserAdmController(key, InviteService, MessageService, $mdDialog) {
        var processCtrl = this;
        processCtrl.invite = {};

        processCtrl.accept = function accept() {
            InviteService.acceptInviteUserAdm(processCtrl.invite.key).then(function success() {
                MessageService.showToast('Convite aceito com sucesso!');
                $mdDialog.hide();
            });
        };

        processCtrl.reject = function reject() {
            InviteService.rejectInviteUserAdm(processCtrl.invite.key).then(function success() {
                MessageService.showToast('Convite recusado!');
                $mdDialog.hide();
            });
        };

        (function main() {
            InviteService.getInvite(key).then(function success(response) {
                let invite = new Invite(response.data);

                if (invite.status === 'sent') {
                    processCtrl.invite = invite;
                } else {
                    MessageService.showToast('Convite já processado!');
                }
            });
        })();
    });
})();