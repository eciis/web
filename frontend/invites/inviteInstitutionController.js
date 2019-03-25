'use strict';
(function() {
    var app = angular.module('app');

    app.controller("InviteInstitutionController", function InviteInstitutionController(
        InviteService, $state, AuthService, InstitutionService, RequestInvitationService,
        STATES, $mdDialog, MessageService, EntityShowcase, STATE_LINKS, SCREEN_SIZES) {
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

        inviteInstCtrl.$onInit = () => {
            inviteInstCtrl._loadSentInvitations();
            inviteInstCtrl._loadSentRequests();
        };

        inviteInstCtrl.toggleElement = function toggleElement(flagName) {
            inviteInstCtrl[flagName] = !inviteInstCtrl[flagName];
        };

        inviteInstCtrl.cancelInvite = function cancelInvite() {
            inviteInstCtrl.invite = {};
        };

        inviteInstCtrl.resetForm = () => {
            inviteInstCtrl.inviteInstForm.$setPristine();
            inviteInstCtrl.inviteInstForm.$setUntouched();
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
                MessageService.showErrorToast('Convite inválido!');
            } else if (!inviteInstCtrl.user.hasPermission('analyze_request_inst')) {
                MessageService.showErrorToast('Você não tem permissão para enviar este tipo de convite.');
            } else {
                var suggestionInstName = inviteInstCtrl.invite.suggestion_institution_name;
                promise = InstitutionService.searchInstitutions(suggestionInstName, INSTITUTION_STATE, 'institution');
                promise.then(function success(response) {
                    inviteInstCtrl.showDialogOrSendInvite(response, ev);
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
                templateUrl: Utils.selectFieldBasedOnScreenSize('app/invites/existing_institutions.html',
                    'app/invites/existing_institutions_mobile.html', SCREEN_SIZES.SMARTPHONE),
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            }).then(_ => {
                inviteInstCtrl.resetForm();
            });
        };

        inviteInstCtrl.sendInstInvite = function sendInstInvite(invite) {
            var promise = InviteService.sendInviteInst(invite);
            promise.then(function success(response) {
                    inviteInstCtrl.invite = {};
                    invite.status = 'sent';
                    invite.sender_name = inviteInstCtrl.user.name;
                    invite.key = response.key;
                    inviteInstCtrl.sent_invitations.push(invite);
                    inviteInstCtrl.showInvites = true;
                    inviteInstCtrl.showSendInvites = false;
                    inviteInstCtrl.resetForm();
                    MessageService.showInfoToast('Convite enviado com sucesso!');
                });
            return promise;
        };

        inviteInstCtrl.showPendingRequestDialog = function showPendingRequestDialog(event, request) {
            const template = Utils.selectFieldBasedOnScreenSize(
                "app/requests/request_institution_processing.html",
                "app/requests/request_institution_processing_mobile.html",
                SCREEN_SIZES.SMARTPHONE
            );
            $mdDialog.show({
                templateUrl: template,
                controller: "RequestProcessingController",
                controllerAs: "requestCtrl",
                parent: angular.element(document.body),
                targetEvent: event,
                clickOutsideToClose:true,
                locals: {
                    "request": request,
                    "updateRequest": inviteInstCtrl._updateRequest
                },
                openFrom: '#fab-new-post',
                closeTo: angular.element(document.querySelector('#fab-new-post'))
            });
        };

        inviteInstCtrl._updateRequest = (request, status) => {
            request.status = status;
            _.remove(inviteInstCtrl.sent_requests, (req) => request.key === req.key);
        }

        inviteInstCtrl.goToInst = function goToInst(institutionKey) {
            $state.go(STATES.INST_TIMELINE, {institutionKey: institutionKey});
        };

        inviteInstCtrl.resendInvite = function resendInvite(inviteKey, event) {
            var confirm = $mdDialog.confirm({ onComplete: designOptions });
            confirm
                .clickOutsideToClose(false)
                .title('Reenviar convite')
                .textContent('Você deseja reenviar o convite?')
                .ariaLabel('Reenviar')
                .targetEvent(event)
                .ok('Reenviar')
                .cancel('Cancelar');
            var promise = $mdDialog.show(confirm);
            promise.then(function () {
                InviteService.resendInvite(inviteKey).then(function success() {
                    MessageService.showInfoToast("Convite reenviado com sucesso.");
                });
            }, function () {
                MessageService.showInfoToast('Cancelado.');
            });
            return promise;
        };

        function designOptions() {
            var $dialog = angular.element(document.querySelector('md-dialog'));
            var $actionsSection = $dialog.find('md-dialog-actions');
            var $cancelButton = $actionsSection.children()[0];
            var $confirmButton = $actionsSection.children()[1];
            angular.element($confirmButton).removeClass('md-primary');
            angular.element($cancelButton).removeClass('md-primary');
            angular.element($confirmButton).addClass('green-button-text');
            angular.element($cancelButton).addClass('green-button-text');
        }

        inviteInstCtrl._loadSentRequests = () => {
            var institution_key = inviteInstCtrl.user.current_institution.key;
            RequestInvitationService.getRequestsInst(institution_key).then(function success(requests) {
                var isSentRequest = createRequestSelector('sent', 'REQUEST_INSTITUTION');
                inviteInstCtrl.sent_requests = requests.filter(isSentRequest);
            }, function error() {
                $state.go(STATES.HOME);
            });
        }
        
        inviteInstCtrl._loadSentInvitations = () => {
            InviteService.getSentInstitutionInvitations().then(function success(response) {
                var requests = response;
                getSentInvitations(requests);
                getAcceptedInvitations(requests);
            }, function error() {
                $state.go(STATES.HOME);
            });
        }

        inviteInstCtrl.hasNewRequests = () => {
            return inviteInstCtrl.sent_requests.length > 0;
        };

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

        inviteInstCtrl.goToActiveInst = (institution) => {
            if (institution.state === "active") {
                inviteInstCtrl.goToInst(institution.key);
            } else {
                MessageService.showErrorToast("Institutição inativa!");
            }
        };

        inviteInstCtrl.createIconBtn = (...args) => {
            return EntityShowcase.createIconBtn(...args)
        };

    });
})();