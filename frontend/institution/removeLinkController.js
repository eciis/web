'use strict';

(function() {
    const app = angular.module('app');

    app.controller('RemoveLinkController', function RemoveLinkController(child, parent, request, RequestInvitationService,
         InstitutionService, MessageService, $q, $mdDialog) {
        const removeLinkCtrl = this;

        const REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
        const REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";

        removeLinkCtrl.parent = parent;
        removeLinkCtrl.child = child;

        removeLinkCtrl.confirmLinkRemoval = function confirmLinkRemoval() {
            const isParent = true;

            InstitutionService.removeLink(child.key, parent.key, isParent).then(
                function success(data) {
                    acceptRequest();
                    MessageService.showToast('Vínculo removido.');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                }
            );
        };

        function acceptRequest() {
            acceptRequestInstitution().then(function success() {
                request.status = 'accepted';
                $mdDialog.cancel();
                MessageService.showToast('Solicitação aceita com sucesso');
            }, function error(response) {
                MessageService.showToast(response.data.msg);   
            });
        }

        removeLinkCtrl.rejectRequest = function rejectRequest(event) {
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

        function getTextContent(type_of_invite) {
            let childHasParent = inviteInstHierCtrl.hasParent && type_of_invite === REQUEST_CHILDREN;
            if(childHasParent) {
                message = 'Atenção: sua instituição já possui uma superior, deseja substituir?';
            } else {
                message = 'Confirmar aceitação de solicitação?';
            }
            return message;
        }
    });
})();