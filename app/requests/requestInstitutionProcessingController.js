'use strict';

(function() {
    var app = angular.module('app');

    app.controller('RequestInstitutionProcessingController', function RequestProcessingController(AuthService, RequestInvitationService,
        MessageService, InstitutionService, key, $state, $mdDialog) {
        var requestController = this;

        requestController.institution = null;
        requestController.requestKey = key;

        requestController.user = AuthService.getCurrentUser();

        requestController.parent = null;

        requestController.acceptRequest = function acceptRequest() {
            resolveRequest().then(function success() {
                MessageService.showToast("Solicitação aceita!");
                requestController.hideDialog();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        };

        function resolveRequest() {
            if (requestController.request.type_of_invite === REQUEST_PARENT) {
                return RequestInvitationService.acceptInstParentRequest(requestController.request.key);
            } else if (requestController.request.type_of_invite === REQUEST_CHILDREN) {
                return RequestInvitationService.acceptInstChildrenRequest(requestController.request.key);
            } else {
                return RequestInvitationService.acceptRequest(requestController.request.key);
            }
        }

        requestController.rejectRequest = function rejectInvite(event){
            var promise = RequestInvitationService.showRejectDialog(event);

            promise.then(function() {
                deleteRequest().then(function success() {
                    MessageService.showToast("Solicitação rejeitada!");
                    requestController.hideDialog();
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
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

        function deleteRequest() {
            if (requestController.request.type_of_invite === REQUEST_PARENT) {
                return RequestInvitationService.rejectInstParentRequest(requestController.request.key);
            } else if (requestController.request.type_of_invite === REQUEST_CHILDREN) {
                return RequestInvitationService.rejectInstChildrenRequest(requestController.request.key);
            } else {
                return RequestInvitationService.rejectRequest(requestController.requestKey);
            }
        }

        requestController.hideDialog = function hideDialog() {
            $mdDialog.hide();
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

        function loadRequest(){
            RequestInvitationService.getRequest(requestController.requestKey).then(function success(response) {
                requestController.request = new Invite(response.data);
                if (requestController.request.status === 'sent') {
                    loadInstitution(requestController.request.institution_key);
                } else {
                    requestController.hideDialog();
                    MessageService.showToast("Você já resolveu esta solicitação.");
                }
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        requestController.showMessage = function() {
            var message = '  solicitou ser membro de:';
            return message;
        };

        requestController.goToInstitution = function goToInstitution(institutionKey) {
            window.open(makeUrl(institutionKey), '_blank');
        };

        function makeUrl(institutionKey){
            var currentUrl = window.location.href;
            currentUrl = currentUrl.split('#');
            return currentUrl[0] + $state.href('app.institution', {institutionKey: institutionKey});
        }

        (function main () {
            loadRequest();
        })();
    });
})();