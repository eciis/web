'use strict';

(function() {
    var app = angular.module('app');

    app.controller('ProcessInviteUserAdmController', function ProcessInviteUserAdmController(key, type_of_dialog, InviteService, MessageService, $mdDialog) {
        var processCtrl = this;
        processCtrl.invite = {};
        processCtrl.type_of_dialog = type_of_dialog;
        processCtrl.isAccepting = false;

        processCtrl.accept = function accept() {
            InviteService.acceptInviteUserAdm(processCtrl.invite.key).then(function success() {
                MessageService.showToast('Convite aceito com sucesso!');
                processCtrl.type_of_dialog = 'accepted';
                processCtrl.isAccepting = true;
            });
        };

        processCtrl.reject = function reject() {
            InviteService.rejectInviteUserAdm(processCtrl.invite.key).then(function success() {
                MessageService.showToast('Convite recusado!');
                $mdDialog.hide();
            });
        };

        processCtrl.close = function close() {
            $mdDialog.hide();
        };

        (function main() {
            InviteService.getInvite(key).then(function success(response) {
                let invite = new Invite(response.data);

                if (invite.status === 'sent' || type_of_dialog !== 'accept') {
                    processCtrl.invite = invite;
                } else {
                    MessageService.showToast('Convite já processado!');
                    processCtrl.close();
                }
            });
        })();
    });
})();