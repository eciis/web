'use strict';

(function() {
    var app = angular.module('app');

    app.controller('ProcessInviteUserAdmController', function ProcessInviteUserAdmController(key, typeOfDialog, InviteService, MessageService, AuthService, $mdDialog) {
        var processCtrl = this;

        processCtrl.VIEW_INVITE_SENDER = 'VIEW_ACCEPTED_INVITATION_SENDER';
        processCtrl.VIEW_INVITE_INVITEE = 'VIEW_ACCEPTED_INVITATION_INVITEE';
        processCtrl.ACCEPT_INVITATION = 'ACCEPT_INVITATION';
        processCtrl.invite = {};
        processCtrl.typeOfDialog = typeOfDialog;
        processCtrl.isAccepting = false;
        processCtrl.current_user = AuthService.getCurrentUser();

        processCtrl.accept = function accept() {
            InviteService.acceptInviteUserAdm(processCtrl.invite.key).then(function success() {
                processCtrl.current_user.institutions_admin.push(processCtrl.invite.institution_key);
                set_inst_admin(processCtrl.current_user.institutions);
                set_to_super_user(processCtrl.invite);
                AuthService.save();
                processCtrl.typeOfDialog = processCtrl.VIEW_INVITE_INVITEE;
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
         * This method takes the invitation from the server and verifies that the status is sent, 
         * if yes it releases the dialog so that the user can accept or reject the invitation, if not, 
         * verifies if who is trying to access the invitation is the user who sent it, using the variable 
         * typeOfDialog. If it is verified that who is accessing is the user who sent the invitation, 
         * it removes the key from the institution in which he was an administrator, if is not the user 
         * who sent the invitation that is accessing, shows a message indicating that the invitation 
         * was already processed.
         */
        function getInvite() {
            InviteService.getInvite(key).then(function success(response) {
                let invite = new Invite(response.data);

                if (invite.status === 'sent' || typeOfDialog === processCtrl.VIEW_INVITE_SENDER) {
                    processCtrl.invite = invite;

                    /**
                     * Will enter this condition when the dialog type is 'accepted' 
                     * (when the user is sending the invitation).
                     */
                    if(typeOfDialog === processCtrl.VIEW_INVITE_SENDER) {
                        _.remove(processCtrl.current_user.institutions_admin, function(url) {
                            return getKey(url) === invite.institution_key;
                        });
                        remove_super_user_permission(invite);
                        AuthService.save();
                    }

                } else {
                    processCtrl.close();
                    MessageService.showToast('Convite já processado!');
                }
            });
        }

        /**
         * This method iterates through the user list that is accepting the invitation 
         * to become an administrator and picks up the institution in which it will be 
         * the new administrator and switches the administrator key to the user key.
         * @param {*} user_institutions - Institutions list of new admin 
         */
        function set_inst_admin(user_institutions) {
            let institution = user_institutions.reduce(
                (instFound, institution) => (institution.key === processCtrl.invite.institution_key) ? institution : instFound, 
                {}
            );
            institution.admin = processCtrl.current_user.key;
        }

        /**
         * This method add super user permissions when the transferring administration is 
         * send by 'Departamento do Complexo Industrial e Inovacao em Saude'
         */
        function set_to_super_user(invite) {
            /** TODO: Change how to check if is the super user.
             *  @author: Maiana Brito - 04/04/2018
             */
            if(invite.institution.name === 'Departamento do Complexo Industrial e Inovacao em Saude'){
                let permission_inst = _.set({}, invite.institution.key, true);
                processCtrl.current_user.permissions['analyze_request_inst'] = permission_inst;
                processCtrl.current_user.permissions['send_invite_inst'] = permission_inst;
            }
        }

        function remove_super_user_permission(invite){
            /** TODO: Change how to check if is the super user.
             *  @author: Maiana Brito - 04/04/2018
             */
            if(invite.institution.name === 'Departamento do Complexo Industrial e Inovacao em Saude'){
                let permission_analyze = processCtrl.current_user.hasPermission('analyze_request_inst', invite.institution.key);
                let permission_send = processCtrl.current_user.hasPermission('send_invite_inst', invite.institution.key);
                let isOldAdmin = processCtrl.typeOfDialog === processCtrl.VIEW_INVITE_SENDER;
                if(permission_analyze && permission_send && isOldAdmin){
                    delete processCtrl.current_user.permissions['analyze_request_inst']
                    delete processCtrl.current_user.permissions['send_invite_inst']
                }
            }
        }

        (function main() {
            getInvite();
        })();
    });
})();