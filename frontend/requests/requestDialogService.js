"use strict";

(function() {
    var app = angular.module("app"); 

    app.service("RequestDialogService", function RequestDialogService(RequestInvitationService, InviteService, $mdDialog,
    MessageService) {
        var service = this;

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

        service.showRequestDialog = function showRequestDialog(dialogProperties, notification, event) {
            getRequest(notification.entity.key, notification.entity_type).then(
                function success(data) {
                    var request = new Invite(data);
                    selectDialogToShow(dialogProperties, request, event);
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                }
            );
        }

        function selectDialogToShow(dialogProperties, request, event) {
            var isRequestResolved = request.isStatusOn('rejected') || request.isStatusOn('accepted');
            if(isRequestResolved) {
                showResolvedReqDialog(event);
                return;
            }

            switch(request.type_of_invite) {
                case "REQUEST_INSTITUTION_PARENT":
                case "REQUEST_INSTITUTION_CHILDREN":
                    service.showHierarchyDialog(request, event)
                    break;
                default:
                    dialogProperties.locals.request = request;
                    showPendingReqDialog(dialogProperties, event);
            }
        }

        function showResolvedReqDialog(event) {
            function ResolvedRequesCtrl($mdDialog) {
                var controll = this;
                controll.hide = function hide() {
                    $mdDialog.hide();
                };
            }

            $mdDialog.show({
                templateUrl: "app/requests/resolved_request_dialog.html",
                controller: ResolvedRequesCtrl,
                controllerAs: 'ctrl',
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true
            });
        }

        function showPendingReqDialog(dialogProperties, event) {
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
        }

        function getRequest(invitekey, entityType) {
            switch(entityType) {
                case 'REQUEST_USER':
                    return RequestInvitationService.getRequest(invitekey);
                case 'REQUEST_INSTITUTION':
                    return RequestInvitationService.getRequestInst(invitekey);
                case 'REQUEST_INSTITUTION_CHILDREN':
                    return RequestInvitationService.getInstChildrenRequest(invitekey);
                case 'REQUEST_INSTITUTION_PARENT':
                    return RequestInvitationService.getInstParentRequest(invitekey);
                case 'USER_ADM' || "ACCEPT_INVITE_USER_ADM":
                    return InviteService.getInvite(invitekey);
            } 
        }
    });
})();