'use strict';

(function() {
    var app = angular.module('app');

    app.controller('ProcessInviteUserAdmController', function ProcessInviteUserAdmController(key, type_of_dialog, InviteService, MessageService, AuthService, $mdDialog) {
        var processCtrl = this;

        processCtrl.VIEW_INVITE_SENDER = 'VIEW_ACCEPTED_INVITATION_SENDER';
        processCtrl.VIEW_INVITE_INVITEE = 'VIEW_ACCEPTED_INVITATION_INVITEE';
        processCtrl.ACCEPT_INVITATION = 'ACCEPT_INVITATION';
        processCtrl.invite = {};
        processCtrl.type_of_dialog = type_of_dialog;
        processCtrl.isAccepting = false;
        processCtrl.current_user = AuthService.getCurrentUser();

        processCtrl.accept = function accept() {
            InviteService.acceptInviteUserAdm(processCtrl.invite.key).then(function success() {
                processCtrl.current_user.institutions_admin.push(processCtrl.invite.institution_key);
                AuthService.save();
                processCtrl.type_of_dialog = processCtrl.VIEW_INVITE_INVITEE;
                processCtrl.isAccepting = true;
                MessageService.showToast('Convite aceito com sucesso!');
            });
        };

        processCtrl.reject = function reject() {
            InviteService.rejectInviteUserAdm(processCtrl.invite.key).then(function success() {
                processCtrl.close();
                MessageService.showToast('Convite recusado!');
            });
        };
        
        processCtrl.close = function close() {
            $mdDialog.hide();
        };

        /**
         * This method takes the invitation from the server and verifies that the status is send, 
         * if yes it releases the dialog so that the user can accept or reject the invitation, if not, 
         * verifies that who is trying to access the invitation is the user who sent it, using the variable 
         * type_of_dialog. If it is verified that who is accessing is the user who sent the invitation, 
         * it removes the key from the institution in which he was an administrator, if is not the user 
         * who sent the invitation that is accessing, shows a message indicating that the invitation 
         * was already processed.
         */
        function getInvite() {
            InviteService.getInvite(key).then(function success(response) {
                let invite = new Invite(response.data);

                if (invite.status === 'sent' || type_of_dialog === processCtrl.VIEW_INVITE_SENDER) {
                    processCtrl.invite = invite;

                    /**
                     * Will enter this condition when the dialog type is 'accepted' 
                     * (when the user is sending the invitation).
                     */
                    if(type_of_dialog === processCtrl.VIEW_INVITE_SENDER) {
                        _.remove(processCtrl.current_user.institutions_admin, function(url) {
                            return getKey(url) === invite.institution_key;
                        });

                        AuthService.save();
                    }

                } else {
                    processCtrl.close();
                    MessageService.showToast('Convite já processado!');
                }
            });
        }

        (function main() {
            getInvite();
        })();
    });
})();