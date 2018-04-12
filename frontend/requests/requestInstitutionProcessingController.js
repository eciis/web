'use strict';

(function() {
    var app = angular.module('app');

    app.controller('RequestInstitutionProcessingController', function RequestProcessingController(AuthService, RequestInvitationService,
        MessageService, InstitutionService, request, $state, $mdDialog) {
        var requestController = this;

        requestController.institution = null;
        requestController.user = AuthService.getCurrentUser();

        requestController.parent = null;
        requestController.isSent = false;

        requestController.acceptRequest = function acceptRequest() {
            RequestInvitationService.acceptRequestInst(request.key).then(function success() {
                MessageService.showToast("Solicitação aceita!");
                requestController.hideDialog();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        };

        requestController.rejectRequest = function rejectRequest(event){
            var promise = RequestInvitationService.showRejectDialog(event);

            promise.then(function() {
                RequestInvitationService.rejectRequestInst(request.key).then(function success() {
                    MessageService.showToast("Solicitação rejeitada!");
                    requestController.hideDialog();
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        requestController.getFullAddress = function getFullAddress(institution) {
            var instObj = new Institution(institution);
            return instObj.getFullAddress();
        };

        requestController.hideDialog = function hideDialog() {
            $mdDialog.hide();
        };

        requestController.cancelDialog = function cancelDialog() {
            $mdDialog.cancel();
        };

        requestController.getSizeGtSmDialog = function getSizeGtSmDialog() {
            return request.status === 'sent' ? '45' : '25';
        };

        requestController.isAnotherCountry = function isAnotherCountry() {
            if(requestController.parent)
                return requestController.parent.address.country !== 'Brasil';
        };

        function loadInstitution(institutionKey) {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                requestController.institution = response.data;
                formatPositions();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        function formatPositions() {
            requestController.parent = requestController.institution;
        }
        
        (function main () {
            if (request.status === 'sent') {
                loadInstitution(request.institution_key);
            }
        })();
    });
})();