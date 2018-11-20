"use strict";

(function() {
		angular
		.module('app')
    .controller('UserRequestFormController', function (AuthService, RequestInvitationService, MessageService, $state) {
        const userReqFormCtrl = this;

        userReqFormCtrl.user = AuthService.getCurrentUser();
        userReqFormCtrl.selectedInst = $state.params.institution;
        userReqFormCtrl.requests = [];

				/**
				 * Called after the controller is constructed
				 * and had its bindings initialized
				 */
        userReqFormCtrl.$onInit = function () {
            loadRequests();
        };

				/**
				 * Get the appropriated message to be showed depending on 
				 * whether the request was already sent or not.
				 */
        userReqFormCtrl.getMessage = function () {
            const formMsg = "Para finalizar o pedido de convite, preencha suas informações institucionais";
            const requestSentMsg = `Sua solicitação de convite foi enviada e esta em analise pelo administrador
             de sua instituição na plataforma e-CIS. Voce recebera a confirmação em seu e-mail.`
            return userReqFormCtrl.isRequestSent ? requestSentMsg : formMsg;
        };

				/**
				 * Send the user request
				 */
        userReqFormCtrl.sendRequest = function () {
            const dataInvite = {
                institution_key : userReqFormCtrl.selectedInst.key,
                sender_key : userReqFormCtrl.user.key,
                admin_key : userReqFormCtrl.selectedInst.admin.key,
                is_request : true,
                type_of_invite : 'REQUEST_USER',
                sender_name : userReqFormCtrl.user.name,
                office : userReqFormCtrl.request.office,
                institutional_email : userReqFormCtrl.request.email
            };

            const request = new Invite(dataInvite);
            RequestInvitationService.sendRequest(request, userReqFormCtrl.selectedInst.key)
                .then(_ => {
                    userReqFormCtrl.isRequestSent = true;
                })
                .catch(_ => {
                    MessageService.showToast("Um erro ocorreu. Verifique as informações e tente novamente")
                });
        };

				/**
				 * Perform the appropriated action depending on 
				 * whether the request was already sent or not.
				 */
        userReqFormCtrl.onClick = function () {
            userReqFormCtrl.isRequestSent ? AuthService.logout() : verifyAndSendRequest();
        };

				/**
				 * Get the appropriated button title depending on 
				 * whether the request was already sent or not.
				 */
        userReqFormCtrl.getBtnTitle = function () {
            return userReqFormCtrl.isRequestSent ? "Início" : "Finalizar";
        };

				/**
				 * Return to the user inactive state
				 */
        userReqFormCtrl.goBack = function () {
            $state.go('user_inactive');
        }

				/**
				 * Show an error message to the user in case the request 
				 * to this institution has already been sent, otherwise
				 * it sends the request
				 */
        function verifyAndSendRequest () {
            if (wasInstRequested()) {
                MessageService.showToast("Você já solicitou para fazer parte dessa instituição.");
            } else {
                userReqFormCtrl.sendRequest();
            }
        };

				/**
				 * Check if the institution was already requested
				 */
        function wasInstRequested () {
            return userReqFormCtrl.requests
                .filter(request => request.status === "sent")
                .map(request => request.sender_key)
                .includes(userReqFormCtrl.user.key);
        }

				/**
				 * Load the selected institution requests
				 */
        function loadRequests () {
            if(userReqFormCtrl.selectedInst) {
                RequestInvitationService.getRequests(userReqFormCtrl.selectedInst.key)
                .then(requests => {
                    userReqFormCtrl.requests = requests;
                });
            }
        }

    });
})();