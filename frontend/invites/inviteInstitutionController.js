'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstitutionController", function InviteInstitutionController(
        InviteService, $mdToast, $state, AuthService, InstitutionService, RequestInvitationService, $mdDialog, MessageService) {
        var inviteInstCtrl = this;

        inviteInstCtrl.invite = {};
        inviteInstCtrl.sent_invitations = [];
        inviteInstCtrl.sent_requests = [];
        inviteInstCtrl.existing_institutions = [];
        inviteInstCtrl.showSendInvites = true;
        inviteInstCtrl.showInvites = false;
        inviteInstCtrl.showRequests = false;
        inviteInstCtrl.showSentInvitations = false;
        
        var INSTITUTION_STATE = "active,pending";
        var invite;

        inviteInstCtrl.user = AuthService.getCurrentUser();


        inviteInstCtrl.showHideSendInvites = function showHideSendInvites() { 
            inviteInstCtrl.showSendInvites = !inviteInstCtrl.showSendInvites;
        };

        inviteInstCtrl.showHideInvites =  function showHideInvites() {
            inviteInstCtrl.showInvites = !inviteInstCtrl.showInvites;
        };

        inviteInstCtrl.showHideRequests =  function showHideRequests() {
            inviteInstCtrl.showRequests = !inviteInstCtrl.showRequests;
        };

        inviteInstCtrl.showHideSentInvitations =  function showHideSentInvitations() {
            inviteInstCtrl.showSentInvitations = !inviteInstCtrl.showSentInvitations;
        };

        inviteInstCtrl.cancelInvite = function cancelInvite() {
            inviteInstCtrl.invite = {};
        };

        inviteInstCtrl.checkInstInvite = function checkInstInvite(ev) {
            var promise;
            var currentInstitutionKey = inviteInstCtrl.user.current_institution.key;

            inviteInstCtrl.invite.institution_key = currentInstitutionKey;
            inviteInstCtrl.invite.admin_key = inviteInstCtrl.user.key;
            inviteInstCtrl.invite.sender_key = inviteInstCtrl.user.key;
            inviteInstCtrl.invite.type_of_invite = 'INSTITUTION';
            invite = new Invite(inviteInstCtrl.invite);

            if (!invite.isValid()) {
                MessageService.showToast('Convite inválido!');
            } else {
                var suggestionInstName = inviteInstCtrl.invite.suggestion_institution_name;
                promise = InstitutionService.searchInstitutions(suggestionInstName, INSTITUTION_STATE, 'institution');
                promise.then(function success(response) {
                    inviteInstCtrl.showDialogOrSendInvite(response.data, ev);
                });
                return promise;
            }
        };

        inviteInstCtrl.showDialogOrSendInvite = function showDialogOrSendInvite(data, ev) {
            inviteInstCtrl.existing_institutions = data;
            if(_.isEmpty(inviteInstCtrl.existing_institutions)) {
                inviteInstCtrl.sendInstInvite(invite);
            } else {
                inviteInstCtrl.showDialog(ev, invite);
            }
        };

        inviteInstCtrl.showDialog = function showDialog(ev, invite) {
            $mdDialog.show({
                locals: {
                    'institution': {},
                    'institutions': inviteInstCtrl.existing_institutions,
                    'invite': invite,
                    'requested_invites': [],
                    'isHierarchy': false,
                    'inviteController': inviteInstCtrl
                },
                controller: 'SuggestInstitutionController',
                controllerAs: 'suggestInstCtrl',
                templateUrl: 'app/invites/existing_institutions.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        inviteInstCtrl.sendInstInvite = function sendInstInvite(invite) {
            var promise = InviteService.sendInviteInst(invite);
            promise.then(function success() {
                    inviteInstCtrl.invite = {};
                    invite.status = 'sent';
                    invite.sender_name = inviteInstCtrl.user.name;
                    inviteInstCtrl.sent_invitations.push(invite);
                    inviteInstCtrl.showInvites = true;
                    inviteInstCtrl.showSendInvites = false;
                    MessageService.showToast('Convite enviado com sucesso!');
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
            return promise;
        };

        inviteInstCtrl.showPendingRequestDialog = function showPendingRequestDialog(request) {
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

        inviteInstCtrl.goToInst = function goToInst(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        function loadSentRequests() {
            RequestInvitationService.getRequestsInst().then(function success(response) {
                inviteInstCtrl.sent_requests = response.data;
            }, function error(response) {
                $state.go('app.home');
                MessageService.showToast(response.data.msg);
            });
        }

        function loadSentInvitations() {
            InviteService.getSentInstitutionInvitations().then(function success(response) {
                inviteInstCtrl.sent_invitations = response.data;
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