'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstitutionController", function InviteInstitutionController(
        InviteService, $mdToast, $state, AuthService, InstitutionService, RequestInvitationService, $mdDialog, MessageService) {
        var inviteController = this;

        inviteController.invite = {};
        inviteController.sent_invitations = [];
        inviteController.sent_requests = [];
        inviteController.existing_institutions = [];
        inviteController.showSendInvite = true;
        var INSTITUTION_STATE = "active,pending";

        var invite;

        inviteController.user = AuthService.getCurrentUser();

        inviteController.cancelInvite = function cancelInvite() {
            inviteController.invite = {};
        };

        inviteController.checkInstInvite = function checkInstInvite(ev) {
            var promise;
            var currentInstitutionKey = inviteController.user.current_institution.key;

            inviteController.invite.institution_key = currentInstitutionKey;
            inviteController.invite.admin_key = inviteController.user.key;
            inviteController.invite.sender_key = inviteController.user.key;
            inviteController.invite.type_of_invite = 'INSTITUTION';
            invite = new Invite(inviteController.invite);

            if (!invite.isValid()) {
                MessageService.showToast('Convite inválido!');
            } else {
                var suggestionInstName = inviteController.invite.suggestion_institution_name;
                promise = InstitutionService.searchInstitutions(suggestionInstName, INSTITUTION_STATE, 'institution');
                promise.then(function success(response) {
                    inviteController.showDialogOrSendInvite(response.data, ev);
                });
                return promise;
            }
        };

        inviteController.showDialogOrSendInvite = function showDialogOrSendInvite(data, ev) {
            inviteController.existing_institutions = data;
            if(_.isEmpty(inviteController.existing_institutions)) {
                inviteController.sendInstInvite(invite);
            } else {
                inviteController.showDialog(ev, invite);
            }
        };

        inviteController.showDialog = function showDialog(ev, invite) {
            $mdDialog.show({
                locals: {
                    'institution': {},
                    'institutions': inviteController.existing_institutions,
                    'invite': invite,
                    'requested_invites': [],
                    'isHierarchy': false,
                    'inviteController': inviteController
                },
                controller: 'SuggestInstitutionController',
                controllerAs: 'suggestInstCtrl',
                templateUrl: 'app/invites/existing_institutions.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        inviteController.sendInstInvite = function sendInstInvite(invite) {
            var promise = InviteService.sendInviteInst(invite);
            promise.then(function success() {
                    inviteController.invite = {};
                    invite.status = 'sent';
                    invite.sender_name = inviteController.user.name;
                    inviteController.sent_invitations.push(invite);
                    inviteController.showInvites = true;
                    inviteController.showSendInvite = false;
                    MessageService.showToast('Convite enviado com sucesso!');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
            return promise;
        };

        inviteController.showPendingRequestDialog = function showPendingRequestDialog(request) {
            $mdDialog.show({
                templateUrl: "app/requests/request_institution_processing.html",
                controller: "RequestInstitutionProcessingController",
                controllerAs: "requestCtrl",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: {
                    "key": request.key
                },
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            }).then(function success() {
                request.status = 'accepted';
            });
        };

        inviteController.goToInst = function goToInst(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        function loadSentRequests() {
            RequestInvitationService.getRequestsInst().then(function success(requests) {
                inviteController.sent_requests = requests;
            }, function error(response) {
                $state.go('app.home');
                MessageService.showToast(response.data.msg);
            });
        }

        function loadSentInvitations() {
            InviteService.getSentInstitutionInvitations().then(function success(response) {
                inviteController.sent_invitations = response.data;
            }, function error(response) {
                $state.go('app.home');
                MessageService.showToast(response.data.msg);
            });
        }

        (function main() {
            loadSentInvitations();
            loadSentRequests();
        })();
    });
})();