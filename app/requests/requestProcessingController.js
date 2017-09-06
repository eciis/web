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

            promise.then(function success() {
                MessageService.showToast("Pedido aceito!");
                goHome();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        };

        requestController.rejectRequest = function rejectInvite(event){
            var promise = RequestInvitationService.showRejectDialog(event);

                promise.then(function() {
                    deleteRequest();
                }, function() {
                    MessageService.showToast('Cancelado');
                });
                return promise;
        };

        function deleteRequest() {
            var promise = RequestInvitationService.rejectRequest(requestController.requestKey);
            promise.then(function success() {
                MessageService.showToast("Pedido rejeitado!");
                goHome();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }


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