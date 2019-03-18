"use strict";

(function() {
    var app = angular.module("app"); 

    app.service("RequestDialogService", function RequestDialogService(RequestInvitationService, InviteService, $mdDialog,
    MessageService) {
        var service = this;

        const REQUEST_USER = 'REQUEST_USER';
        const REQUEST_INSTITUTION = 'REQUEST_INSTITUTION';
        const REQUEST_PARENT = 'REQUEST_INSTITUTION_PARENT';
        const REQUEST_CHILDREN = 'REQUEST_INSTITUTION_CHILDREN';
        const ACCEPT_USER_ADM = 'ACCEPT_INVITE_USER_ADM';
        const USER_ADM = 'USER_ADM';
        const RESOLVED_REQUEST = 'RESOLVED_REQUEST';
        const INVALID_REQUEST = 'INVALID_REQUEST';

        service.showHierarchyDialog = function showHierarchyDialog(request, event) {
            var promise = $mdDialog.show({
                controller: 'AnalyseHierarchyRequestController',
                controllerAs: 'analyseHierReqCtrl',
                templateUrl: 'app/requests/analyse_hierarchy_request_dialog.html',
                targetEvent: event,
                locals: {
                    request: request
                }
            });
            return promise;
        };

        service.showRequestDialog = function showRequestDialog(notification, event, dialogProperties) {
            getRequest(notification.entity.key, notification.entity_type).then(
                function success(data) {
                    var request = new Invite(data);
                    selectDialogToShow(request, event, dialogProperties);
                }, function error(response) {
                    MessageService.showErrorToast(response.data.msg);
                }
            );
        };

        service.showResolvedReqDialog = function (event) {
            const message = "Esta solicitação já foi resolvida";
            MessageService.showMessageDialog(event, message);
        };

        service.showInvalidReqDialog = function (event) {
            const message = "Esta solicitação não é mais válida";
            MessageService.showMessageDialog(event, message);
        };

        service.showPendingReqDialog = function (dialogProperties, event) {
            $mdDialog.show({
                controller: dialogProperties.controller,
                controllerAs: dialogProperties.controllerAs,
                templateUrl: dialogProperties.templateUrl,
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: dialogProperties.locals,
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };

        function selectDialogToShow(request, event, dialogProperties) {
            let requestType = request.type_of_invite;
            requestType = request.isStatusOn('sent') ? requestType : RESOLVED_REQUEST;
            requestType = request.areInstitutionsValid() ? requestType : INVALID_REQUEST;

            switch(requestType) {
                case RESOLVED_REQUEST:
                    service.showResolvedReqDialog(event); break;
                case INVALID_REQUEST:
                    service.showInvalidReqDialog(event); break;
                case REQUEST_PARENT:
                case REQUEST_CHILDREN:
                    service.showHierarchyDialog(request, event); break;
                case REQUEST_INSTITUTION:
                    dialogProperties.locals.request = request;
                    service.showPendingReqDialog(dialogProperties, event); break;
                default:
                    dialogProperties.locals.request = request;
                    service.showPendingReqDialog(dialogProperties, event);
            }
        }

        function getRequest(invitekey, entityType) {
            switch(entityType) {
                case REQUEST_USER:
                    return RequestInvitationService.getRequest(invitekey);
                case REQUEST_INSTITUTION:
                    return RequestInvitationService.getRequestInst(invitekey);
                case REQUEST_CHILDREN:
                    return RequestInvitationService.getInstChildrenRequest(invitekey);
                case REQUEST_PARENT:
                    return RequestInvitationService.getInstParentRequest(invitekey);
                case USER_ADM:
                case ACCEPT_USER_ADM:
                    return InviteService.getInvite(invitekey);
            } 
        }
    });
})();