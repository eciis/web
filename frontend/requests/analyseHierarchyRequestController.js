'use strict';

(function() {
    const app = angular.module('app');

    app.controller('AnalyseHierarchyRequestController', function AnalyseHierarchyRequestController(request,
         RequestInvitationService, InstitutionService, MessageService, $mdDialog) {
        const analyseHierReqCtrl = this;
    
        const REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
        const REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";
        var parent, child;

        
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
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                }
            );
        };

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
                $mdDialog.hide();
                MessageService.showToast('Solicitação aceita com sucesso');
            }, function error(response) {
                MessageService.showToast(response.data.msg);   
            });
        }

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