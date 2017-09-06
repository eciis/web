'use strict';

(function() {
   var app = angular.module('app');

   app.controller('NewInviteController', function NewInviteController(InstitutionService, AuthService, UserService, InviteService, $mdToast,
    $mdDialog, MessageService, $state) {
        var newInviteCtrl = this;

        newInviteCtrl.institution = null;

        newInviteCtrl.inviteKey = $state.params.key;

        newInviteCtrl.user = AuthService.getCurrentUser();

        var institutionKey;

        newInviteCtrl.acceptInvite = function acceptInvite(event) {
            if (newInviteCtrl.invite.type_of_invite === "USER") {
                newInviteCtrl.addInstitution(event);
            } else {
                newInviteCtrl.updateStubInstitution();
            }
        };

        newInviteCtrl.addInstitution =  function addInstitution(event) {
            var promise = UserService.addInstitution(newInviteCtrl.user,
                newInviteCtrl.institution.key, newInviteCtrl.inviteKey);
                promise.then(function success(userSaved) {
                    newInviteCtrl.user.removeInvite(newInviteCtrl.inviteKey);
                    newInviteCtrl.user.institutions = userSaved.institutions;
                    newInviteCtrl.user.follows = userSaved.follows;
                    newInviteCtrl.user.state = 'active';
                    newInviteCtrl.user.current_institution = newInviteCtrl.institution;
                    AuthService.save();
                    goHome();
                    showAlert(event, newInviteCtrl.institution.name);
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
            return promise;
        };

        newInviteCtrl.updateStubInstitution =function updateStubInstitution() {
            var promise = InstitutionService.save(institutionKey, newInviteCtrl.inviteKey);
            promise.then(
                function success(institutionSaved){
                    MessageService.showToast('Cadastro de instituição realizado com sucesso');
                    newInviteCtrl.user.removeInvite(newInviteCtrl.inviteKey);
                    newInviteCtrl.user.institutions.push(institutionSaved);
                    newInviteCtrl.user.institutions_admin.push(institutionSaved.key);
                    newInviteCtrl.user.follow(institutionSaved);
                    newInviteCtrl.user.current_institution = institutionSaved;
                    newInviteCtrl.user.state = 'active';
                    AuthService.save();
                    $state.go('app.manage_institution.edit_info', {institutionKey: institutionSaved.key});
                },
                function error(response) {
                    MessageService.showToast(response.data.msg);
            });
            return promise;
        };

        newInviteCtrl.isInviteUser = function isInviteUser(){
            return newInviteCtrl.invite.type_of_invite === "USER";
        };

        newInviteCtrl.rejectInvite = function rejectInvite(event){
            var confirm = $mdDialog.confirm();
                confirm
                    .clickOutsideToClose(false)
                    .title('Rejeitar convite')
                    .textContent("Ao rejeitar o convite, seu convite será removido e não poderá ser aceito posteriormente." +
                         " Deseja rejeitar?")
                    .ariaLabel('Rejeitar convite')
                    .targetEvent(event)
                    .ok('Sim')
                    .cancel('Não');
                    var promise = $mdDialog.show(confirm);
                promise.then(function() {
                    deleteInvite();
                }, function() {
                    MessageService.showToast('Cancelado');
                });
                return promise;
        };

        newInviteCtrl.getFullAddress = function getFullAddress() {
            if(newInviteCtrl.institution) {
                var address = newInviteCtrl.institution.address;
                var fullAddress = address.street + ", " + address.number + ", " + address.neighbourhood + 
                                 ", " + address.city + ", " + address.state + ", " + address.country;
                return fullAddress;
            }
        };


        function deleteInvite() {
            var promise = InviteService.deleteInvite(newInviteCtrl.inviteKey);
            promise.then(function success() {
                AuthService.reload().then(function() {
                    goHome();
                });
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }

        function goHome() {
            $state.go("app.home");
        }

        function loadInstitution(institutionKey) {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                newInviteCtrl.institution = response.data;
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        function showAlert(event, institutionName) {
             $mdDialog.show(
               $mdDialog.alert()
                 .parent(angular.element(document.querySelector('#popupContainer')))
                 .clickOutsideToClose(true)
                 .title('Bem-vindo')
                 .textContent('Você agora é membro de ' + institutionName)
                 .ariaLabel('Novo membro')
                 .ok('Ok')
                 .targetEvent(event)
             );
        }

        function loadInvite(){
            InviteService.getInvite(newInviteCtrl.inviteKey).then(function success(response) {
                newInviteCtrl.invite = new Invite(response.data);
                if(newInviteCtrl.invite.status === 'sent') {
                    institutionKey = (newInviteCtrl.invite.type_of_invite === "USER") ? newInviteCtrl.invite.institution_key : newInviteCtrl.invite.stub_institution.key;
                    loadInstitution(institutionKey);
                } else {
                    $state.go("app.home");
                    MessageService.showToast("Você já utilizou este convite.");
                }
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        loadInvite();
   });
})();