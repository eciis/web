'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InviteInstHierarchieController", function InviteInstHierarchieController(
        InviteService,$mdToast, $mdDialog, $state, AuthService, InstitutionService, MessageService, RequestInvitationService, $q) {

        var inviteInstHierCtrl = this;
        var institutionKey = $state.params.institutionKey;
        var invite;
        var INSTITUTION_PARENT = "INSTITUTION_PARENT";
        var ACTIVE = "active";
        var INSTITUTION_STATE = "active,pending";
        var REQUEST_PARENT = "REQUEST_INSTITUTION_PARENT";
        var REQUEST_CHILDREN = "REQUEST_INSTITUTION_CHILDREN";

        inviteInstHierCtrl.user = AuthService.getCurrentUser();

        inviteInstHierCtrl.institution = {};
        inviteInstHierCtrl.invite = {};
        inviteInstHierCtrl.hasParent = false;
        inviteInstHierCtrl.showSendInvite = true;
        inviteInstHierCtrl.showParentHierarchie = false;
        inviteInstHierCtrl.showChildrenHierarchie = false;
        inviteInstHierCtrl.showRequestInvites = false;
        inviteInstHierCtrl.existing_institutions = [];
        inviteInstHierCtrl.requested_invites = [];
        inviteInstHierCtrl.isLoadingSubmission = false;

        inviteInstHierCtrl.toggleElement = function toggleElement(flagName) {
            inviteInstHierCtrl[flagName] = !inviteInstHierCtrl[flagName];
        };

        inviteInstHierCtrl.checkInstInvite = function checkInstInvite(ev) {
            var promise;

            inviteInstHierCtrl.invite.institution_key = institutionKey;
            inviteInstHierCtrl.invite.admin_key = inviteInstHierCtrl.user.key;
            invite = new Invite(inviteInstHierCtrl.invite);
            if (!invite.isValid()) {
                MessageService.showToast('Convite inválido!');
            } else if(inviteInstHierCtrl.hasParent && invite.type_of_invite === INSTITUTION_PARENT) {
                MessageService.showToast("Já possui instituição superior");
            } else {
                var suggestionInstName = inviteInstHierCtrl.invite.suggestion_institution_name;
                promise = InstitutionService.searchInstitutions(suggestionInstName, INSTITUTION_STATE, 'institution');
                promise.then(function success(response) {
                    inviteInstHierCtrl.processInvite(response.data, ev);
                });
                return promise;
            }
        };

        inviteInstHierCtrl.processInvite = function processInvite(data, ev) {
            inviteInstHierCtrl.existing_institutions = data;
            if(_.isEmpty(inviteInstHierCtrl.existing_institutions)) {
                inviteInstHierCtrl.sendInstInvite(invite);
            } else {
                inviteInstHierCtrl.showDialog(ev, invite);
            }
        };

        inviteInstHierCtrl.showDialog = function showDialog(ev, invite) {
            $mdDialog.show({
                locals: {
                    'institution': inviteInstHierCtrl.institution,
                    'institutions': inviteInstHierCtrl.existing_institutions,
                    'invite': invite,
                    'requested_invites': inviteInstHierCtrl.requested_invites,
                    'isHierarchy': true,
                    'inviteController': inviteInstHierCtrl
                },
                controller: 'SuggestInstitutionController',
                controllerAs: 'suggestInstCtrl',
                templateUrl: 'app/invites/existing_institutions.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose: true
            });
            inviteInstHierCtrl.showSendInvite = false;
        };

        inviteInstHierCtrl.sendInstInvite = function sendInstInvite(invite) {
            inviteInstHierCtrl.isLoadingSubmission = true;
            var deferred = $q.defer();
            var invite_body = {invite_body: invite}
            var promise = InviteService.sendInvite(invite_body);
            promise.then(function success() {
                    MessageService.showToast('Convite enviado com sucesso!');
                    addInvite(invite);
                    invite.type_of_invite === INSTITUTION_PARENT ?
                        inviteInstHierCtrl.showParentHierarchie = true : inviteInstHierCtrl.showChildrenHierarchie = true;
                    deferred.resolve();
                    inviteInstHierCtrl.isLoadingSubmission = false;
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                    deferred.reject();
                    inviteInstHierCtrl.isLoadingSubmission = false;
                });
            return deferred.promise;
        };

        inviteInstHierCtrl.sendRequestToExistingInst = function sendRequestToExistingInst(invite, institution_requested_key) {
            invite.institution_requested_key = institution_requested_key;
            invite.sender_key = inviteInstHierCtrl.user.key;
            var deferred = $q.defer();
            
            sendRequest(invite).then(function success() {
                MessageService.showToast('Convite enviado com sucesso!');
                addInviteToRequests(invite);
                if (invite.type_of_invite === REQUEST_PARENT) {
                    addParentInstitution(institution_requested_key);
                    inviteInstHierCtrl.showParentHierarchie = true;
                } else {
                    addChildrenInstitution(institution_requested_key);
                    inviteInstHierCtrl.showChildrenHierarchie = true;
                }
                deferred.resolve();
            }, function error() {
                deferred.reject();
            });
            
            return deferred.promise;
        };

        function sendRequest(invite) {
            if (invite.type_of_invite === INSTITUTION_PARENT) {
                invite.type_of_invite = REQUEST_PARENT;
                return RequestInvitationService.sendRequestToParentInst(invite, invite.institution_key);
            } else {
                invite.type_of_invite = REQUEST_CHILDREN;
                return RequestInvitationService.sendRequestToChildrenInst(invite, invite.institution_key);
            }
        }

        /*
        * Add a stub link between institution that's who invited (child) and the institution that's been invitee (parent).
        * @param institution_requested_key - key of institution that receiving the request
        * @return - promise
        */
        function addParentInstitution(institution_requested_key) {
            var promise = InstitutionService.getInstitution(institution_requested_key);
            promise.then(function(response) {
                inviteInstHierCtrl.institution.addParentInst(response.data);
                inviteInstHierCtrl.hasParent = true;
            });
            return promise;
        }

        /*
        * Add a stub link between institution that's who invited (parent) and the institution that's been invitee (child).
        * @param institution_requested_key - key of institution that receiving the request
        * @return - promise
        */
        function addChildrenInstitution(institution_requested_key) {
            var promise = InstitutionService.getInstitution(institution_requested_key);
            promise.then(function(response) {
                inviteInstHierCtrl.institution.addChildInst(response.data);
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
                    inviteInstHierCtrl.institution.addChildInst(response.data);
               } else {
                    inviteInstHierCtrl.institution.addParentInst(response.data);
                    inviteInstHierCtrl.hasParent = true;
               }
            });
            return promise;
        }

        inviteInstHierCtrl.cancelInvite = function cancelInvite() {
            inviteInstHierCtrl.invite = {};
            inviteInstHierCtrl.showSendInvite = false;
        };

        inviteInstHierCtrl.goToActiveInst = function goToActiveInst(institution) {
            if (inviteInstHierCtrl.isActive(institution)) {
                inviteInstHierCtrl.goToInst(institution.key);
            } else {
                MessageService.showToast("Institutição inativa!");
            }
        };

        inviteInstHierCtrl.goToInst = function goToInst(institutionKey) {
            $state.go('app.institution.timeline', {institutionKey: institutionKey});
        };

        inviteInstHierCtrl.isActive = function isActive(institution) {
            return institution.state === ACTIVE;
        };

        function loadInstitution() {
            var promise;
            promise = InstitutionService.getInstitution(institutionKey).then(function success(response) {
                inviteInstHierCtrl.institution = new Institution(response.data);
                inviteInstHierCtrl.hasParent = !_.isEmpty(inviteInstHierCtrl.institution.parent_institution);
                getRequests();
            }, function error(response) {
                $state.go('app.institution.timeline', {institutionKey: institutionKey});
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
                inviteInstHierCtrl.requested_invites = inviteInstHierCtrl.requested_invites.concat(response);
            });
        }

        function getChildrenRequests() {
            RequestInvitationService.getChildrenRequests(institutionKey).then(function success(response) {
                inviteInstHierCtrl.requested_invites = inviteInstHierCtrl.requested_invites.concat(response);
            });
        }

        function addInviteToRequests(invite) {
            invite.status = 'sent';
            inviteInstHierCtrl.requested_invites.push(invite);
        };

        inviteInstHierCtrl.removeLink = function removeLink(institution, isParent, event) {
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
                InstitutionService.removeLink(inviteInstHierCtrl.institution.key, institution.key, isParent).then(function success() {
                    MessageService.showToast('Conexão removida com sucesso');
                    if(isParent) {
                        inviteInstHierCtrl.hasParent = false;
                        inviteInstHierCtrl.institution.parent_institution = {};
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
            _.remove(inviteInstHierCtrl.institution.children_institutions, function(child) {
                return child.key === institution.key;
            });
        }

        inviteInstHierCtrl.acceptRequest = function acceptRequest(request, type_of_invite, event) {
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

        inviteInstHierCtrl.rejectRequest = function rejectRequest(request, type_of_invite, event) {
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

        inviteInstHierCtrl.isReqSentByCurrentInst = function isReqSentByCurrentInst(request) {
            return institutionKey === request.institution_key;
        };

        inviteInstHierCtrl.isReqSentToCurrentInst = function isReqSentToCurrentInst(request) {
            return request.status === 'sent' && institutionKey === request.institution_requested_key;
        }

        inviteInstHierCtrl.goToRequestedInst = function goToRequestedInst(request) {
            var inst_key = inviteInstHierCtrl.isReqSentByCurrentInst(request) ? request.institution_requested_key : request.institution_key;
            inviteInstHierCtrl.goToInst(inst_key);
        };

        inviteInstHierCtrl.getReqInstName = function getReqInstName(request) {
            var inst_name = inviteInstHierCtrl.isReqSentByCurrentInst(request) ? request.requested_inst_name : request.institution_admin.name;
            return inst_name;
        };

        function isOvewritingParent(type_of_invite) {
            var message;
            if (inviteInstHierCtrl.institution.parent_institution && type_of_invite === REQUEST_CHILDREN) {
                message = 'Atenção: sua instituição já possui uma superior, deseja substituir?';
            } else {
                message = 'Confirmar aceitação de solicitação?';
            }
            return message;
        }

        function addInvite(invite) {
            inviteInstHierCtrl.invite = {};
            inviteInstHierCtrl.institution.addInvite(invite);
            var stub = inviteInstHierCtrl.institution.createStub(invite);
            if (invite.type_of_invite === INSTITUTION_PARENT){
                inviteInstHierCtrl.institution.addParentInst(stub);
                inviteInstHierCtrl.hasParent = true;
            } else {
                inviteInstHierCtrl.institution.addChildInst(stub);
            }
            inviteInstHierCtrl.showSendInvite = false;
        }

        inviteInstHierCtrl.showMessage = function(request) {
            var message;
            if(inviteInstHierCtrl.isReqSentByCurrentInst(request)) {
                message = request.type_of_invite === REQUEST_CHILDREN ?
                    'Solicitação para ser uma instituição subordinada (Aguardando confirmação)' :
                    'Solicitação para ser uma instituição superior (Aguardando confirmação)';
            } else if(request.type_of_invite === REQUEST_CHILDREN) {
                message = 'Solicitação para ser a instituição superior';
            } else {
                message = 'Solicitação para ser uma instituição subordinada';
            }
            return message;
        };

        inviteInstHierCtrl.getSuggestedName = function getSuggestedName(institution) {
            if (institution.invite) {
                return institution.invite.suggestion_institution_name || institution.name;
            }
        };

        inviteInstHierCtrl.hasRequested = function hasRequested() {
            return _.find(inviteInstHierCtrl.requested_invites,
                request => request.status === 'sent' && request.institution_requested_key === institutionKey);
        };

        function designOptions() {
                var $dialog = angular.element(document.querySelector('md-dialog'));
                var $actionsSection = $dialog.find('md-dialog-actions');
                var $cancelButton = $actionsSection.children()[0];
                var $confirmButton = $actionsSection.children()[1];
                angular.element($confirmButton).addClass('md-raised md-warn');
                angular.element($cancelButton).addClass('md-primary');
        }

        inviteInstHierCtrl.canRemoveInst = function canRemoveInst(institution) {
            var hasChildrenLink = institution.parent_institution === inviteInstHierCtrl.institution.key;
            return inviteInstHierCtrl.user.permissions.remove_inst[institution.key] && hasChildrenLink;
        };

        inviteInstHierCtrl.linkParentStatus = function linkParentStatus() {
            const parentInstitution = inviteInstHierCtrl.institution.parent_institution;
            const institutionKey = inviteInstHierCtrl.institution.key;
            return parentInstitution && _.find(parentInstitution.children_institutions, inst => inst.key === institutionKey ) ? "confirmado" : "não confirmado";
        };

        inviteInstHierCtrl.linkChildrenStatus = function linkChildrenStatus(institution) {
            return institution.parent_institution && institution.parent_institution === inviteInstHierCtrl.institution.key ? "confirmado" : "não confirmado";
        };

        inviteInstHierCtrl.removeChild = function removeChild(institution, ev) {
            $mdDialog.show({
                templateUrl: "app/invites/removeChildDialog.html",
                targetEvent: ev,
                clickOutsideToClose: true,
                controller: "RemoveChildController",
                controllerAs: 'ctrl',
                locals: {
                    parent: inviteInstHierCtrl.institution,
                    child: institution
                }
            });
        };

        loadInstitution();
    });
})();