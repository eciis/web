"use strict";

(function() {
    var app = angular.module('app');

    app.controller('RequestProcessingController', function RequestProcessingController(AuthService, RequestInvitationService,
        MessageService, InstitutionService, key, $state, $mdDialog) {
        var requestController = this;

        requestController.institution = null;

        requestController.requestKey = key;

        var REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
        var REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";

        requestController.user = AuthService.getCurrentUser();

        requestController.acceptRequest = function acceptRequest(event) {
            var promise = MessageService.showConfirmationDialog(event, 'Aceitar solicitação', isOvewritingParent());
            promise.then(function() {
                resolveRequest();
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        function resolveRequest() {
            var promise;
            if (requestController.request.type_of_invite === REQUEST_PARENT) {
                promise = RequestInvitationService.acceptInstParentRequest(requestController.request.key);
            } else if (requestController.request.type_of_invite === REQUEST_CHILDREN) {
                RequestInvitationService.acceptInstChildrenRequest(requestController.request.key);
            } else {
                promise = RequestInvitationService.acceptRequest(requestController.request.key);
            }
            promise.then(function success() {
                MessageService.showToast("Solicitação aceita!");
                hideDialog();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }

        requestController.rejectRequest = function rejectInvite(event){
            var promise = RequestInvitationService.showRejectDialog(event);

            promise.then(function() {
                deleteRequest();
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        function isOvewritingParent() {
            var message;
            if (requestController.institution.parent_institution) {
                message = 'Atenção: sua instituição já possui uma superior, deseja substituir?';
            } else {
                message = 'Confirmar aceitação?';
            }
            return message;
        }

        function deleteRequest() {
            var promise;
            if (requestController.request.type_of_invite === REQUEST_PARENT) {
                promise = RequestInvitationService.rejectInstParentRequest(requestController.request.key);
            } else if (requestController.request.type_of_invite === REQUEST_CHILDREN) {
                promise = RequestInvitationService.rejectInstChildrenRequest(requestController.request.key);
            } else {
                promise = RequestInvitationService.rejectRequest(requestController.requestKey);
            }
            promise.then(function success() {
                MessageService.showToast("Solicitação rejeitada!");
                hideDialog();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }

        function hideDialog() {
            $mdDialog.hide();
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
                if (requestController.request.status === 'sent' && isInstRequest(requestController.request)) {
                    loadInstitution(requestController.request.institution_requested_key);
                } else if (requestController.request.status === 'sent' && !isInstRequest(requestController.request)) {
                    loadInstitution(requestController.request.institution_key);
                } else {
                    hideDialog();
                    MessageService.showToast("Você já resolveu esta solicitação.");
                }
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        requestController.showMessage = function() {
            var message;
            if(requestController.request.type_of_invite === REQUEST_CHILDREN) {
                message = requestController.request.institution.name + ' solicitou ser a instituição superior de:';
            } else if(requestController.request.type_of_invite === REQUEST_PARENT) {
                message = requestController.request.institution.name + ' solicitou ser uma instituição subordinada de:';
            } else {
                message = requestController.request.sender + '  solicitou ser membro de:';
            }
            return message;
        };

        function isInstRequest(request) {
            var isParentRequest = request.type_of_invite === REQUEST_PARENT;
            var isChildrenRequest = request.type_of_invite === REQUEST_CHILDREN;
            return isParentRequest || isChildrenRequest;
        }

        (function main () {
            loadRequest();
        })();
    });
})();