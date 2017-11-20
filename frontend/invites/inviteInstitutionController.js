'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstitutionController", function InviteInstitutionController(
        InviteService, $mdToast, $state, AuthService, InstitutionService, RequestInvitationService, $mdDialog, MessageService) {
        var inviteInstCtrl = this;

        inviteInstCtrl.invite = {};
        inviteInstCtrl.sent_invitations = [];
        inviteInstCtrl.accepted_invitations = [];
        inviteInstCtrl.sent_requests = [];
        inviteInstCtrl.existing_institutions = [];
        inviteInstCtrl.showSendInvites = true;
        inviteInstCtrl.showInvites = false;
        inviteInstCtrl.showRequests = false;
        inviteInstCtrl.showSentInvitations = false;
        
        var INSTITUTION_STATE = "active,pending";
        var invite;

        inviteInstCtrl.user = AuthService.getCurrentUser();


        inviteInstCtrl.showHideElement = function showHideElement(flagName) {
            inviteInstCtrl[flagName] = !inviteInstCtrl[flagName];
        };

        inviteInstCtrl.calcHeight = function calcHeight(list=[], itemHeight=5) {
            var maxRequestsNumber = 4;
            var maxHeight = itemHeight * maxRequestsNumber + 'em';
            var actualHeight = list.length * itemHeight + 'em';
            var calculedHeight = list.length < maxRequestsNumber ? actualHeight : maxHeight;
            return {height: calculedHeight};
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
                var requests = response.data || [];
                var isSentRequest = createRequestSelector('sent', 'REQUEST_INSTITUTION');
                inviteInstCtrl.sent_requests = requests.filter(isSentRequest);
            }, function error(response) {
                $state.go('app.home');
                MessageService.showToast(response.data.msg);
            });
        }
        
        function loadSentInvitations() {
            InviteService.getSentInstitutionInvitations().then(function success(response) {
                var requests = response.data;
                getSentInvitations(requests);
                getAcceptedInvitations(requests);
            }, function error(response) {
                $state.go('app.home');
                MessageService.showToast(response.data.msg);
            });
        }
        
        function getSentInvitations(requests) {
            var isSentInvitation = createRequestSelector('sent', 'INSTITUTION');
            inviteInstCtrl.sent_invitations = requests.filter(isSentInvitation);
        }
        
        function getAcceptedInvitations(requests) {
            var isAcceptedInvitation = createRequestSelector('accepted', 'INSTITUTION');
            inviteInstCtrl.accepted_invitations = requests.filter(isAcceptedInvitation);
        }
        
        function createRequestSelector(status, type_of_invite) {
            return function(request) {
                return request.status === status && request.type_of_invite === type_of_invite;
            }
        }

        (function main() {
            loadSentInvitations();
            loadSentRequests();
        })();
    });
})();