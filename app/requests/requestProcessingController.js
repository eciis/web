"use strict";

(function() {
    var app = angular.module('app');

    app.controller('RequestProcessingController', function RequestProcessingController(AuthService, RequestInvitationService,
        MessageService, InstitutionService, $state, $mdDialog) {
        var requestController = this;

        requestController.institution = null;

        requestController.requestKey = $state.params.key;

        requestController.user = AuthService.getCurrentUser();

        requestController.acceptRequest = function acceptRequest() {
            var promise = RequestInvitationService.acceptRequest(requestController.request.key);

            promise.then(function success(response) {
                MessageService.showToast("Pedido aceito!");
                goHome();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        };

        requestController.rejectInvite = function rejectInvite(event){
            var confirm = $mdDialog.confirm();
                confirm
                    .clickOutsideToClose(false)
                    .title('Rejeitar convite')
                    .textContent("Ao rejeitar o convite, seu convite será removido e não poderá ser aceito posteriormente." +
                         " Deseja rejeitar?")
                    .ariaLabel('Rejeitar convite')
                    .targetEvent(event)
                    .ok('Sim')
                    .cancel('Não');
                    var promise = $mdDialog.show(confirm);
                promise.then(function() {
                    //deleteInvite();
                }, function() {
                    MessageService.showToast('Cancelado');
                });
                return promise;
        };


        function goHome() {
            $state.go("app.home");
        }

        function loadInstitution(institutionKey) {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                requestController.institution = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        function loadRequest(){
            RequestInvitationService.getRequest(requestController.requestKey).then(function success(response) {
                requestController.request = new Invite(response.data);
                if(requestController.request.status === 'sent') {
                    loadInstitution(requestController.request.institution_key);
                } else {
                    $state.go("app.home");
                    MessageService.showToast("Você já utilizou este pedido.");
                }
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        loadRequest();
    });
})();