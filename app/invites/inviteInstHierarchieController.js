'use strict';

(function() {
    var app = angular.module('app');

    app.controller("InviteInstHierarchieController", function InviteInstHierarchieController(
        InviteService,$mdToast, $mdDialog, $state, AuthService, InstitutionService, MessageService) {
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


        inviteInstCtrl.checkInstInvite = function checkInstInvite(ev) {
            var promise;
            invite = new Invite(inviteInstCtrl.invite, inviteInstCtrl.invite.type_of_invite,
                institutionKey, inviteInstCtrl.user.key);
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
        };

        inviteInstCtrl.sendInstInvite = function sendInstInvite(invite) {
            var promise = InviteService.sendInvite(invite);
            promise.then(function success(response) {
                    MessageService.showToast('Convite enviado com sucesso!');
                    addInvite(invite);
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
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                inviteInstCtrl.institution = new Institution(response.data);
                inviteInstCtrl.hasParent = !_.isEmpty(inviteInstCtrl.institution.parent_institution);
            }, function error(response) {
                $state.go('app.institution', {institutionKey: institutionKey});
                MessageService.showToast(response.data.msg);
            });
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

        loadInstitution();
    });
})();