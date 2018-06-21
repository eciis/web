'use strict';

(function() {
    const app = angular.module('app');

    app.controller('AnalyseHierarchyRequestController', function AnalyseHierarchyRequestController(request,
         RequestInvitationService, InstitutionService, MessageService, $mdDialog) {
        const analyseHierReqCtrl = this;
    
        const REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
        const REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";
        var parent, child;

        analyseHierReqCtrl.PENDING_REQUEST = true;
        analyseHierReqCtrl.PROCESSING_HIERARCHY_VIEW = false;

        (function loadInstitutions() { 
            switch(request.type_of_invite){
                case REQUEST_PARENT:
                    parent = request.requested_institution;
                    child = request.institution;    
                    break;
                case REQUEST_CHILDREN:
                    parent = request.institution;
                    child = request.requested_institution;
                    analyseHierReqCtrl.hasToRemoveLink = child.parent_institution;
            }

            analyseHierReqCtrl.parent = parent;
            analyseHierReqCtrl.child = child;
        })();

        analyseHierReqCtrl.confirmRequest = function confirmRequest() {
            analyseHierReqCtrl.hasToRemoveLink ? confirmLinkRemoval() : acceptRequest();
        };

        analyseHierReqCtrl.rejectRequest = function rejectRequest(event) {
            rejectRequestInstitution().then(
                function success() {
                    request.status = 'rejected';
                    $mdDialog.cancel();
                    MessageService.showToast('Solicitação rejeitada com sucesso');
                });
        };

        analyseHierReqCtrl.close = function close() {
            $mdDialog.hide();
            MessageService.showToast('Solicitação aceita com sucesso');
        };

        function confirmLinkRemoval() {
            const isParent = true;
            InstitutionService.removeLink(child.key, parent.key, isParent).then(
                function success() {
                    acceptRequest();
                });
        }

        function acceptRequest() {
            acceptRequestInstitution().then(function success() {
                request.status = 'accepted';
                if(!analyseHierReqCtrl.PROCESSING_HIERARCHY_VIEW) {
                    analyseHierReqCtrl.close();
                }
            });
        }

        function acceptRequestInstitution() {
            switch(request.type_of_invite) {
                case REQUEST_PARENT:
                    analyseHierReqCtrl.PROCESSING_HIERARCHY_VIEW = true;
                    analyseHierReqCtrl.PENDING_REQUEST = false;
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