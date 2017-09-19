'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InviteInstHierarchieController", function InviteInstHierarchieController(
        InviteService,$mdToast, $mdDialog, $state, AuthService, InstitutionService, MessageService, RequestInvitationService) {

        var inviteInstCtrl = this;
        var institutionKey = $state.params.institutionKey;
        var invite;
        var INSTITUTION_PARENT = "INSTITUTION_PARENT";
        var ACTIVE = "active";
        var INSTITUTION_STATE = "active,pending";

        inviteInstCtrl.user = AuthService.getCurrentUser();

        inviteInstCtrl.institution = {};
        inviteInstCtrl.invite = {};
        inviteInstCtrl.hasParent = false;
        inviteInstCtrl.showButton = true;
        inviteInstCtrl.existing_institutions = [];
        inviteInstCtrl.requested_invites = [];


        inviteInstCtrl.checkInstInvite = function checkInstInvite(ev) {
            var promise;

            inviteInstCtrl.invite.institution_key = institutionKey;
            inviteInstCtrl.invite.admin_key = inviteInstCtrl.user.key;
            invite = new Invite(inviteInstCtrl.invite);

            if (!invite.isValid()) {
                MessageService.showToast('Convite inválido!');
            } else if(inviteInstCtrl.hasParent && invite.type_of_invite === INSTITUTION_PARENT) {
                MessageService.showToast("Já possui instituição superior");
            } else {
                var suggestionInstName = inviteInstCtrl.invite.suggestion_institution_name;
                promise = InstitutionService.searchInstitutions(suggestionInstName, INSTITUTION_STATE);
                promise.then(function success(response) {
                    inviteInstCtrl.processInvite(response.data, ev);
                });
                return promise;
            }
        };

        inviteInstCtrl.processInvite = function processInvite(data, ev) {
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
                    'institution': inviteInstCtrl.institution,
                    'institutions': inviteInstCtrl.existing_institutions,
                    'invite': invite,
                    'inviteController': inviteInstCtrl
                },
                controller: 'SuggestInstitutionController',
                controllerAs: 'suggestInstCtrl',
                templateUrl: 'invites/existing_institutions.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
            inviteInstCtrl.showButton = true;
        };

        inviteInstCtrl.sendInstInvite = function sendInstInvite(invite) {
            var promise = InviteService.sendInvite(invite);
            promise.then(function success() {
                    MessageService.showToast('Convite enviado com sucesso!');
                    addInvite(invite);
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
            return promise;
        };

        inviteInstCtrl.sendInviteToExistingInst = function sendInviteToExistingInst(invite, institution_requested_key) {
            invite.institution_requested_key = institution_requested_key;
            invite.sender_key = inviteInstCtrl.user.key;
            var promise;
            if (invite.type_of_invite === INSTITUTION_PARENT) {
                invite.type_of_invite = "REQUEST_INSTITUTION_PARENT";
                promise = RequestInvitationService.sendRequestToParentInst(invite, institution_requested_key);
            } else {
                invite.type_of_invite = "REQUEST_INSTITUTION_CHILDREN";
                promise = RequestInvitationService.sendRequestToChildrenInst(invite, institution_requested_key);
            }
            promise.then(function success() {
                MessageService.showToast('Convite enviado com sucesso!');
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        };

        inviteInstCtrl.cancelInvite = function cancelInvite() {
            inviteInstCtrl.invite = {};
            inviteInstCtrl.showButton = true;
        };

        inviteInstCtrl.goToInst = function goToInst(institutionKey) {
            $state.go('app.institution', {institutionKey: institutionKey});
        };

        inviteInstCtrl.isActive = function isActive(institution) {
            return institution.state === ACTIVE;
        };

        function loadInstitution() {
            var promise;
            promise = InstitutionService.getInstitution(institutionKey).then(function success(response) {
                inviteInstCtrl.institution = new Institution(response.data);
                inviteInstCtrl.hasParent = !_.isEmpty(inviteInstCtrl.institution.parent_institution);
                getRequests();
            }, function error(response) {
                $state.go('app.institution', {institutionKey: institutionKey});
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }

        function getRequests() {
            getParentRequests();
            getChildrenRequests();
        }

        function getParentRequests() {
            RequestInvitationService.getParentRequests(institutionKey).then(function success(response) {
                inviteInstCtrl.requested_invites = inviteInstCtrl.requested_invites.concat(response.data);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        function getChildrenRequests() {
            RequestInvitationService.getChildrenRequests(institutionKey).then(function success(response) {
                inviteInstCtrl.requested_invites = inviteInstCtrl.requested_invites.concat(response.data);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        inviteInstCtrl.removeLink = function removeLink(institution, isParent) {
            var confirm = $mdDialog.confirm({onComplete: designOptions})
                .clickOutsideToClose(true)
                .title('Confirmar Remoção')
                .textContent('Confirmar a remoção dessa conexão?')
                .ariaLabel('Confirmar Remoção')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');

            var promise = $mdDialog.show(confirm);
            promise.then(function() {
                InstitutionService.removeLink(inviteInstCtrl.institution.key, institution.key, isParent).then(function success() {
                    MessageService.showToast('Conexão removida com sucesso');
                    $state.go('app.home');
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        inviteInstCtrl.acceptRequest = function acceptRequest(request_key, type_of_invite) {
            var confirm = customDialog('accept');
            var promise = $mdDialog.show(confirm);
            promise.then(function() {
                console.log(type_of_invite);
                var accept = type_of_invite === "REQUEST_INSTITUTION_PARENT" ?
                    RequestInvitationService.acceptInstParentRequest(request_key) : RequestInvitationService.acceptInstChildrenRequest(request_key);
                accept.then(function success() {
                    MessageService.showToast('Requisição aceita com sucesso');
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        inviteInstCtrl.rejectRequest = function rejectRequest(request_key, type_of_invite) {
            var confirm = customDialog('reject');
            var promise = $mdDialog.show(confirm);
            promise.then(function() {
                var reject = type_of_invite === "REQUEST_INSTITUTION_PARENT" ?
                    RequestInvitationService.rejectInstParentRequest(request_key) : RequestInvitationService.rejectInstChildrenRequest(request_key);
                reject.then(function success() {
                    MessageService.showToast('Requisição rejeitada com sucesso');
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        function customDialog(operation) {
            var confirm = $mdDialog.confirm({onComplete: designOptions})
                .clickOutsideToClose(true)
                .title(operation === 'accept' ? 'Aceitar requisição' : 'Rejeitar requisição')
                .textContent(operation === 'accept' ? 'Confirmar aceitação?' : 'Confirmar rejeição?')
                .ariaLabel('Aceitar ou rejeitar requisição')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');

            return confirm;
        }

        function addInvite(invite) {
            inviteInstCtrl.invite = {};
            inviteInstCtrl.institution.addInvite(invite);
            var stub = inviteInstCtrl.institution.createStub(invite);
            if (invite.type_of_invite === INSTITUTION_PARENT){
                inviteInstCtrl.institution.addParentInst(stub);
                inviteInstCtrl.hasParent = true;
            }
            else {
                inviteInstCtrl.institution.addChildrenInst(stub);
            }
            inviteInstCtrl.showButton = true;
        }

        function designOptions() {
                var $dialog = angular.element(document.querySelector('md-dialog'));
                var $actionsSection = $dialog.find('md-dialog-actions');
                var $cancelButton = $actionsSection.children()[0];
                var $confirmButton = $actionsSection.children()[1];
                angular.element($confirmButton).addClass('md-raised md-warn');
                angular.element($cancelButton).addClass('md-primary');
        }

        loadInstitution();
    });
})();