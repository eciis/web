"use strict";

(function() {
    var app = angular.module('app');

    app.controller('RequestProcessingController', function RequestProcessingController(AuthService, RequestInvitationService,
        MessageService, InstitutionService, request, $state, $mdDialog) {
        var requestController = this;

        requestController.institution = null;
        requestController.request = request;

        var REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
        var REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";

        requestController.user = AuthService.getCurrentUser();

        requestController.parent = null;
        requestController.children = null;

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
                return RequestInvitationService.rejectRequest(request.key);
            }
        }

        requestController.hideDialog = function hideDialog() {
            $mdDialog.hide();
        };

        requestController.getSizeGtSmDialog = function getSizeGtSmDialog() {
            return requestController.request && requestController.request.status === 'sent' ? '45' : '25';
        };

        function loadInstitution() {
            var institutionKey = requestController.isInstRequest() ? request.institution_requested_key : request.institution_key;
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                requestController.institution = response.data;
                formatPositions();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        function formatPositions() {
            if (requestController.request.type_of_invite === REQUEST_PARENT) {
                requestController.parent = requestController.institution;
                requestController.children = requestController.request.institution;
            } else if (requestController.request.type_of_invite === REQUEST_CHILDREN) {
                requestController.children = requestController.institution;
                requestController.parent = requestController.request.institution;
            } else {
                requestController.parent = requestController.institution;
                requestController.children = requestController.request;
            }
        }

        requestController.showMessage = function() {
            var message;
            if(requestController.request && requestController.request.type_of_invite === REQUEST_CHILDREN) {
                message = ' solicitou ser a instituição superior da seguinte instituição que você administra:';
            } else if(requestController.request && requestController.request.type_of_invite === REQUEST_PARENT) {
                message = ' solicitou ser uma instituição subordinada da seguinte instituição que você administra:';
            } else {
                message = '  solicitou ser membro de:';
            }
            return message;
        };

        requestController.isInstRequest = function() {
            var isParentRequest = request.type_of_invite === REQUEST_PARENT;
            var isChildrenRequest = request.type_of_invite === REQUEST_CHILDREN;
            return isParentRequest || isChildrenRequest;
        };

        requestController.goToInstitution = function goToInstitution(institutionKey) {
            window.open(makeUrl(institutionKey), '_blank');
        };

        function makeUrl(institutionKey){
            var currentUrl = window.location.href;
            currentUrl = currentUrl.split('#');
            return currentUrl[0] + $state.href('app.institution.timeline', {institutionKey: institutionKey});
        }

        (function main () {
            var isRequestSent = request.status === 'sent';
            if(isRequestSent) loadInstitution();
        })();
    });
})();