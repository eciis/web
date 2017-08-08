'use strict';

(function() {
   var app = angular.module('app');

   app.controller('NewInviteController', function NewInviteController(InstitutionService, AuthService, UserService, InviteService, $state, $mdToast,
    $mdDialog, MessageService) {
        var newInviteCtrl = this;

        var observer;

        newInviteCtrl.institution = null;

        newInviteCtrl.inviteKey = $state.params.inviteKey;

        var institutionKey = $state.params.institutionKey;

        var typeOfInvite = $state.params.typeInvite;

        newInviteCtrl.user = AuthService.getCurrentUser();

        newInviteCtrl.acceptInvite = function acceptInvite(event) {
            if (typeOfInvite === "USER") {
                addInstitution(event);
            } else {
                updateStubInstitution();
            }
            
        };

        function addInstitution(event) {
            var promise = UserService.addInstitution(newInviteCtrl.user,
                newInviteCtrl.institution.key, newInviteCtrl.inviteKey);
                promise.then(function success() {
                    AuthService.reload().then(function() {
                        goHome();
                        showAlert(event, newInviteCtrl.institution.name); 
                   });
                }, function error(response) {
                    MessageService.showToast(response.data.msg);
                });
            return promise;
        }

        function updateStubInstitution() {
            var patch = jsonpatch.generate(observer);
                InstitutionService.save(institutionKey, patch, newInviteCtrl.inviteKey).then(
                function success(response){
                    MessageService.showToast('Cadastro de instituição realizado com sucesso');
                    newInviteCtrl.user.removeInviteInst(newInviteCtrl.institution.key);
                    newInviteCtrl.user.follow(response);
                    newInviteCtrl.user.institutions.push(response);
                    newInviteCtrl.user.current_institution = response;
                    newInviteCtrl.user.state = 'active';
                    AuthService.save();
                    $state.go('app.manage_institution.edit_info', {institutionKey: response.key});
                },
                function error(response) {
                    MessageService.showToast(response.data.msg);
            });
        }

        newInviteCtrl.isInviteUser = function isInviteUser(){
            return typeOfInvite === "USER";
        };

        newInviteCtrl.rejectInvite = function rejectInvite(event) {
            
            if (typeOfInvite === "USER"){
                rejectUserInvite(event);
            }else {
                rejectInstitutionInvite(event);
            }
            
        };

        function rejectUserInvite(event){
            var confirm = $mdDialog.confirm();
                confirm
                    .clickOutsideToClose(false)
                    .title('Rejeitar convite')
                    .textContent("Ao rejeitar o convite, você só poderá ser membro com um novo convite." +
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
        }

        function rejectInstitutionInvite(event){
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Refeitar Convite')
                .textContent("Ao rejeitar o convite, seu convite será removido e " +
                    "a instituição não poderá ser criada no sistema. " +
                    "Deseja rejeitar mesmo assim?")
                .ariaLabel('Cancelar Cadastro')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');

                $mdDialog.show(confirm).then(function() {
                    InviteService.deleteInvite(newInviteCtrl.inviteKey).then(
                        function success() {
                            MessageService.showToast('Convite rejeitado');
                            AuthService.logout();
                        }, function error(response) {
                            MessageService.showToast(response.data.msg);
                        }
                    );
                }, function() {
                    MessageService.showToast('Cancelado');
                });
        }
        

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

        function loadInstitution() {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                newInviteCtrl.institution = response.data;
                observer = jsonpatch.observe(newInviteCtrl.institution);
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

        loadInstitution();
   });
})();