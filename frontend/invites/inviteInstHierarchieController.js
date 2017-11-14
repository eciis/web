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
        inviteInstCtrl.showSendInvite = false;
        inviteInstCtrl.showParentHierarchie = false;
        inviteInstCtrl.showChildrenHierarchie = false;
        inviteInstCtrl.showRequestInvites = false;
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
                promise = InstitutionService.searchInstitutions(suggestionInstName, INSTITUTION_STATE, 'institution');
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
                templateUrl: 'app/invites/existing_institutions.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
            inviteInstCtrl.showSendInvite = false;
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

        inviteInstCtrl.sendRequestToExistingInst = function sendRequestToExistingInst(invite, institution_requested_key) {
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
                if (invite.type_of_invite === REQUEST_PARENT) {
                    addInstitution(institution_requested_key);
                } else {
                    addInviteToChildrenRequests(invite);
                }
                deferred.resolve();
            }, function error() {
                deferred.reject();
            });
            return deferred.promise;
        };

        /*
        * For the institution that is sending the request, 'REQUEST_INSTITUTION_PARENT'
        * means that it wants to have requested institution as a parent
        * @param type_of_invite - can be REQUEST_INSTITUTION_PARENT or REQUEST_INSTITUTION_CHILDREN
        * @param institution_requested_key - key of institution that receiving the request
        * @return - promise
        */
        function addInstitution(institution_requested_key) {
            var promise = InstitutionService.getInstitution(institution_requested_key);
            promise.then(function(response) {
                inviteInstCtrl.institution.addParentInst(response.data);
                inviteInstCtrl.hasParent = true;
            });
            return promise;
        }

        /*
        * For the institution that is receiving the request, 'REQUEST_INSTITUTION_PARENT'
        * means that it wants to have institution that sending the request as a children
        * @param type_of_invite - can be REQUEST_INSTITUTION_PARENT or REQUEST_INSTITUTION_CHILDREN
        * @param seding_inst_key - key of institution that sending the request
        * @return - promise
        */
        function addAcceptedInstitution(type_of_invite, sending_inst_key) {
            var promise = InstitutionService.getInstitution(sending_inst_key);
            promise.then(function(response) {
               if (type_of_invite === REQUEST_PARENT) {
                    inviteInstCtrl.institution.addChildrenInst(response.data);
               } else {
                    inviteInstCtrl.institution.addParentInst(response.data);
                    inviteInstCtrl.hasParent = true;
               }
            });
            return promise;
        }

        inviteInstCtrl.cancelInvite = function cancelInvite() {
            inviteInstCtrl.invite = {};
            inviteInstCtrl.showSendInvite = false;
        };

        inviteInstCtrl.goToActiveInst = function goToActiveInst(institution) {
            if (inviteInstCtrl.isActive(institution)) {
                inviteInstCtrl.goToInst(institution.key);
            } else {
                MessageService.showToast("Institutição inativa!");
            }
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
                inviteInstCtrl.requested_invites = inviteInstCtrl.requested_invites.concat(response);
            });
        }

        function getChildrenRequests() {
            RequestInvitationService.getChildrenRequests(institutionKey).then(function success(response) {
                inviteInstCtrl.requested_invites = inviteInstCtrl.requested_invites.concat(response);
            });
        }

        function addInviteToChildrenRequests(invite) {
            invite.status = 'sent';
            inviteInstCtrl.requested_invites.push(invite);
        };

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
                    if(isParent) {
                        inviteInstCtrl.hasParent = false;
                        inviteInstCtrl.institution.parent_institution = {};
                    } else {
                        removeInstFromChildren(institution);
                    }
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        function removeInstFromChildren(institution) {
            _.remove(inviteInstCtrl.institution.children_institutions, function(child) {
                return child.key === institution.key;
            });
        }

        inviteInstCtrl.acceptRequest = function acceptRequest(request, type_of_invite, event) {
            var promise = MessageService.showConfirmationDialog(event, 'Aceitar Solicitação', isOvewritingParent(type_of_invite));
            promise.then(function() {
                var accept = type_of_invite === REQUEST_PARENT ?
                    RequestInvitationService.acceptInstParentRequest(request.key) : RequestInvitationService.acceptInstChildrenRequest(request.key);
                accept.then(function success() {
                    addAcceptedInstitution(type_of_invite, request.institution_key);
                    request.status = 'accepted';
                    MessageService.showToast('Solicitação aceita com sucesso');
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        inviteInstCtrl.rejectRequest = function rejectRequest(request, type_of_invite, event) {
            var promise = MessageService.showConfirmationDialog(event, 'Rejeitar Solicitação', 'Confirmar rejeição da solicitação?');
            promise.then(function() {
                var reject = type_of_invite === REQUEST_PARENT ?
                    RequestInvitationService.rejectInstParentRequest(request.key) : RequestInvitationService.rejectInstChildrenRequest(request.key);
                reject.then(function success() {
                    request.status = 'rejected';
                    MessageService.showToast('Solicitação rejeitada com sucesso');
                });
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        inviteInstCtrl.isReqSentByCurrentInst = function isReqSentByCurrentInst(request) {
            return institutionKey === request.institution_key;
        };

        inviteInstCtrl.goToRequestedInst = function goToRequestedInst(request) {
            var inst_key = inviteInstCtrl.isReqSentByCurrentInst(request) ? request.institution_requested_key : request.institution_key;
            inviteInstCtrl.goToInst(inst_key);
        };

        inviteInstCtrl.getReqInstName = function getReqInstName(request) {
            var inst_name = inviteInstCtrl.isReqSentByCurrentInst(request) ? request.requested_inst_name : request.institution_admin.name;
            return inst_name;
        };

        function isOvewritingParent(type_of_invite) {
            var message;
            if (inviteInstCtrl.institution.parent_institution && type_of_invite === REQUEST_CHILDREN) {
                message = 'Atenção: sua instituição já possui uma superior, deseja substituir?';
            } else {
                message = 'Confirmar aceitação de solicitação?';
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
            } else {
                inviteInstCtrl.institution.addChildrenInst(stub);
            }
            inviteInstCtrl.showSendInvite = false;
        }

        inviteInstCtrl.showMessage = function(request) {
            var message;
            if(inviteInstCtrl.isReqSentByCurrentInst(request)) {
                message = 'Solicitação para ser uma instituição subordinada (Aguardando confirmação)';
            } else if(request.type_of_invite === REQUEST_CHILDREN) {
                message = 'Solicitação para ser a instituição superior';
            } else {
                message = 'Solicitação para ser uma instituição subordinada';
            }
            return message;
        };

        inviteInstCtrl.getSuggestedName = function getSuggestedName(institution) {
            if (institution.invite) {
                return institution.invite.suggestion_institution_name || institution.name;
            }
        };

        function designOptions() {
                var $dialog = angular.element(document.querySelector('md-dialog'));
                var $actionsSection = $dialog.find('md-dialog-actions');
                var $cancelButton = $actionsSection.children()[0];
                var $confirmButton = $actionsSection.children()[1];
                angular.element($confirmButton).addClass('md-raised md-warn');
                angular.element($cancelButton).addClass('md-primary');
        }

        inviteInstCtrl.removeChild = function removeChild(institution, ev) {
            $mdDialog.show({
                templateUrl: "app/invites/removeChildDialog.html",
                targetEvent: ev,
                clickOutsideToClose: true,
                controller: "RemoveChildController",
                controllerAs: 'ctrl',
                locals: {
                    parent: inviteInstCtrl.institution,
                    child: institution
                }
            });
        };

        loadInstitution();
    });
})();