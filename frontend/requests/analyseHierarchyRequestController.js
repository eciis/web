'use strict';

(function() {
    const app = angular.module('app');

    app.controller('AnalyseHierarchyRequestController', function AnalyseHierarchyRequestController(child, parent, request, RequestInvitationService,
         InstitutionService, MessageService, $q, $mdDialog) {
        const analyseHierReqCtrl = this;

        const REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
        const REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";

        analyseHierReqCtrl.parent = parent;
        analyseHierReqCtrl.child = child;
        analyseHierReqCtrl.hasToRemoveLink = child.parent_institution !== null;

        function confirmLinkRemoval() {
            const isParent = true;

            InstitutionService.removeLink(child.key, parent.key, isParent).then(
                function success(data) {
                    acceptRequest();
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                }
            );
        }

        function acceptRequest() {
            acceptRequestInstitution().then(function success() {
                request.status = 'accepted';
                $mdDialog.cancel();
                MessageService.showToast('Solicitação aceita com sucesso');
            }, function error(response) {
                MessageService.showToast(response.data.msg);   
            });
        }

        analyseHierReqCtrl.rejectRequest = function rejectRequest(event) {
            var promise = MessageService.showConfirmationDialog(event, 'Rejeitar Solicitação', 'Confirmar rejeição da solicitação?');
            promise.then(function confirm() {
                rejectRequestInstitution().then(
                    function success() {
                        request.status = 'rejected';
                        MessageService.showToast('Solicitação rejeitada com sucesso');
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                    }
                );
            }, function cancel() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        analyseHierReqCtrl.confirmRequest = function confirmRequest() {
            analyseHierReqCtrl.hasToRemoveLink ? confirmLinkRemoval() : acceptRequest();
        };

        function acceptRequestInstitution() {
            switch(request.type_of_invite) {
                case REQUEST_PARENT:
                    return RequestInvitationService.acceptInstParentRequest(request.key);
                case REQUEST_CHILDREN:
                    return RequestInvitationService.acceptInstChildrenRequest(request.key);
            }
        }

        function rejectRequestInstitution() {
            switch(request.type_of_invite) {
                case REQUEST_PARENT:
                    return RequestInvitationService.rejectInstParentRequest(request.key);
                case REQUEST_CHILDREN:
                    return RequestInvitationService.rejectInstChildrenRequest(request.key);
            }
        }
    });
})();