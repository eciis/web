'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InviteInstHierarchieController", function InviteInstHierarchieController(
        InviteService,$mdToast, $mdDialog, $state, AuthService, InstitutionService, MessageService, RequestInvitationService, $q) {

        var inviteInstCtrl = this;
        var institutionKey = $state.params.institutionKey;
        var invite;
        var INSTITUTION_PARENT = "INSTITUTION_PARENT";
        var ACTIVE = "active";
        var INSTITUTION_STATE = "active,pending";
        var REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
        var REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";

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
                    'requested_invites': inviteInstCtrl.requested_invites,
                    'isHierarchy': true,
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
            var deferred = $q.defer();
            var promise = InviteService.sendInvite(invite);
            promise.then(function success() {
                    MessageService.showToast('Convite enviado com sucesso!');
                    addInvite(invite);
                    deferred.resolve();
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                    deferred.reject();
                });
            return deferred.promise;
        };

        inviteInstCtrl.sendInviteToExistingInst = function sendInviteToExistingInst(invite, institution_requested_key) {
            invite.institution_requested_key = institution_requested_key;
            invite.sender_key = inviteInstCtrl.user.key;
            var deferred = $q.defer();
            var promise;
            if (invite.type_of_invite === INSTITUTION_PARENT) {
                invite.type_of_invite = REQUEST_PARENT;
                promise = RequestInvitationService.sendRequestToParentInst(invite, institution_requested_key);
            } else {
                invite.type_of_invite = REQUEST_CHILDREN;
                promise = RequestInvitationService.sendRequestToChildrenInst(invite, institution_requested_key);
            }
            promise.then(function success() {
                MessageService.showToast('Convite enviado com sucesso!');
                addInstitution(invite.type_of_invite, institution_requested_key);
                deferred.resolve();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                deferred.reject();
            });
            return deferred.promise;
        };

        function addInstitution(type_of_invite, institution_requested_key) {
            var promise = InstitutionService.getInstitution(institution_requested_key);
            promise.then(function(response) {
               if (type_of_invite === REQUEST_PARENT) {
                   inviteInstCtrl.institution.addParentInst(response.data);
                   inviteInstCtrl.hasParent = true;
               } else {
                    inviteInstCtrl.institution.addChildrenInst(response.data);
               }
            });
            return promise;
        }

        function addAcceptedInstitution(type_of_invite, institution_requested_key) {
            var promise = InstitutionService.getInstitution(institution_requested_key);
            promise.then(function(response) {
               if (type_of_invite === REQUEST_CHILDREN) {
                   inviteInstCtrl.institution.addParentInst(response.data);
                   inviteInstCtrl.hasParent = true;
               } else {
                    inviteInstCtrl.institution.addChildrenInst(response.data);
               }
            });
            return promise;
        }

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

        inviteInstCtrl.acceptRequest = function acceptRequest(request, type_of_invite) {
            var confirm = customDialog('accept');
            var promise = $mdDialog.show(confirm);
            promise.then(function() {
                var accept = type_of_invite === "REQUEST_INSTITUTION_PARENT" ?
                    RequestInvitationService.acceptInstParentRequest(request.key) : RequestInvitationService.acceptInstChildrenRequest(request.key);
                accept.then(function success() {
                    addAcceptedInstitution(type_of_invite, request.institution_key);
                    request.status = 'accepted';
                    MessageService.showToast('Requisição aceita com sucesso');
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        inviteInstCtrl.rejectRequest = function rejectRequest(request, type_of_invite) {
            var confirm = customDialog('reject');
            var promise = $mdDialog.show(confirm);
            promise.then(function() {
                var reject = type_of_invite === "REQUEST_INSTITUTION_PARENT" ?
                    RequestInvitationService.rejectInstParentRequest(request.key) : RequestInvitationService.rejectInstChildrenRequest(request.key);
                reject.then(function success() {
                    request.status = 'rejected';
                    MessageService.showToast('Requisição rejeitada com sucesso');
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        function customDialog(operation) {
            var message = isOvewritingParent(operation);
            var confirm = $mdDialog.confirm({onComplete: designOptions})
                .clickOutsideToClose(true)
                .title(operation === 'accept' ? 'Aceitar requisição' : 'Rejeitar requisição')
                .textContent(message)
                .ariaLabel('Aceitar ou rejeitar requisição')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');

            return confirm;
        }

        function isOvewritingParent(operation) {
            var message;
            if (operation === 'accept' && inviteInstCtrl.institution.parent_institution) {
                message = 'Atenção: sua instituição já possui uma superior, deseja substituir?';
            } else if (operation === 'accept' && !inviteInstCtrl.institution.parent_institution) {
                message = 'Confirmar aceitação?';
            } else {
                message = 'Confirmar rejeição?';
            }
            return message;
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