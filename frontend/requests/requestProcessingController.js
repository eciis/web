"use strict";

(function() {
    var app = angular.module('app');

    app.controller('RequestProcessingController', function RequestProcessingController(AuthService, RequestInvitationService,
        MessageService, InstitutionService, request, $state, $mdDialog) {
        var requestController = this;

        var REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
        var REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";
        var REQUEST_INSTITUTION = "REQUEST_INSTITUTION";
        var REQUEST_USER = "REQUEST_USER";
        
        requestController.user = AuthService.getCurrentUser();
        
        requestController.institution = null;
        requestController.parent = null;
        requestController.children = null;
        requestController.isRejecting = false;

        requestController.acceptRequest = function acceptRequest() {
            resolveRequest().then(function success() {
                MessageService.showToast("Solicitação aceita!");
                request.status = 'accepted';
                requestController.hideDialog();
                refreshUser();
            });
        };

        function refreshUser() {
            AuthService.reload();
        }

        function resolveRequest() {
            switch(request.type_of_invite) {
                case REQUEST_PARENT:
                    return RequestInvitationService.acceptInstParentRequest(request.key);
                case REQUEST_CHILDREN:
                    return RequestInvitationService.acceptInstChildrenRequest(request.key);
                case REQUEST_INSTITUTION:
                    return RequestInvitationService.acceptRequestInst(request.key);
                case REQUEST_USER:
                    return RequestInvitationService.acceptRequest(request.key);
            }
        }

        requestController.rejectRequest = function rejectRequest(event){
            requestController.isRejecting = true;
        };

        requestController.confirmReject = function confirmReject() {
            deleteRequest().then(function success() {
                request.status = 'rejected';
                requestController.hideDialog();
                MessageService.showToast("Solicitação rejeitada!");
            });
        };

        requestController.cancelReject = function cancelReject() {
            $mdDialog.cancel();
            MessageService.showToast('Cancelado');
        };

        function deleteRequest() {
            switch(request.type_of_invite) {
                case REQUEST_PARENT:
                    return RequestInvitationService.rejectInstParentRequest(request.key);
                case REQUEST_CHILDREN:
                    return RequestInvitationService.rejectInstChildrenRequest(request.key);
                case REQUEST_INSTITUTION:
                    return RequestInvitationService.rejectRequestInst(request.key);
                case REQUEST_USER:
                    return RequestInvitationService.rejectRequest(request.key);
            }
        }

        requestController.getFullAddress = function getFullAddress(institution) {
            var instObj = new Institution(institution);
            return instObj.getFullAddress();
        };

        requestController.hideDialog = function hideDialog() {
            $mdDialog.hide(request.key);
        };

        requestController.getSizeGtSmDialog = function getSizeGtSmDialog() {
            return request.status === 'sent' && !requestController.isRejecting ? '45' : '25';
        };

        requestController.getChildrenInstName = function getChildrenInstName(size) {
            const returnValue = requestController.children ? 
              Utils.limitString(requestController.children.name ||
              requestController.children.sender_name, size) : "";
            return returnValue;
        };

        requestController.getChildrenInstEmail = function getChildrenInstEmail(size) {
            const returnValue = requestController.children ? 
              Utils.limitString(requestController.children.institutional_email, size) : "";
            return returnValue;
        };	

        requestController.isAnotherCountry = function isAnotherCountry() {
            return requestController.parent && requestController.parent.address.country !== 'Brasil';
        };

        function loadInstitution() {
            var institutionKey = isHierarchyRequest() ? request.institution_requested_key : request.institution_key;
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                requestController.institution = response;
                formatPositions();
                getLegalNature();
                getActuationArea();
            });
        }

        function isHierarchyRequest() {
            var isParentRequest = request.type_of_invite === REQUEST_PARENT;
            var isChildrenRequest = request.type_of_invite === REQUEST_CHILDREN;
            return isParentRequest || isChildrenRequest;
        };

        function formatPositions() {
            switch(request.type_of_invite) {
                case REQUEST_PARENT:
                    requestController.parent = requestController.institution;
                    requestController.children = request.institution;
                    break;
                case REQUEST_CHILDREN:
                    requestController.children = requestController.institution;
                    requestController.parent = request.institution;
                    break;
                case REQUEST_INSTITUTION:
                    requestController.parent = requestController.institution;
                    break;
                case REQUEST_USER:
                    requestController.parent = requestController.institution;
                    requestController.children = request;
            }
        }

        requestController.goToInstitution = function goToInstitution(institutionKey) {
            window.open(makeUrl(institutionKey), '_blank');
        };

        requestController.confirmLinkRemoval = function confirmLinkRemoval() {
            const isParent = true;
            const institutionKey = requestController.children.key;
            const institutionLinkKey = requestController.children.parent_institution.key;

            InstitutionService.removeLink(institutionKey, institutionLinkKey, isParent).then(function success() {
                MessageService.showToast('Vínculo removido.');
                delete requestController.children.parent_institution;
            });
        };

        requestController.isRequestUser = function isRequestUser() {
            return request.type_of_invite == REQUEST_USER;
        };

        function makeUrl(institutionKey){
            var currentUrl = window.location.href;
            currentUrl = currentUrl.split('#');
            return currentUrl[0] + $state.href('app.institution.timeline', {institutionKey: institutionKey});
        }

        function getLegalNature() {
            InstitutionService.getLegalNatures().then(function success(response) {
                requestController.instLegalNature = _.get(response,
                    requestController.parent.legal_nature);
            });
        }

        function getActuationArea() {
            InstitutionService.getActuationAreas().then(function success(response) {
                requestController.instActuationArea = _.get(response,
                    requestController.parent.actuation_area);
            });
        }

        (function main () {
            if(request.status == 'sent') loadInstitution();
        })();
    });
})();
