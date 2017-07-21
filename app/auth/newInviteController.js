'use strict';

(function() {
   var app = angular.module('app');

   app.controller('NewInviteController', function NewInviteController(InstitutionService, AuthService, UserService, InviteService, $state, $mdToast,
    $mdDialog) {
        var newInviteCtrl = this;

        newInviteCtrl.institution = null;

        newInviteCtrl.inviteKey = $state.params.inviteKey;

        var institutionKey = $state.params.institutionKey;

        newInviteCtrl.user = AuthService.getCurrentUser();

        newInviteCtrl.acceptInvite = function acceptInvite(event) {
            var promise = UserService.addInstitution(newInviteCtrl.user,
                newInviteCtrl.institution.key, newInviteCtrl.inviteKey);
            promise.then(function success() {
                AuthService.reload().then(function() {
                    goHome();
                    showAlert(event, newInviteCtrl.institution.name); 
               });
            }, function error(response) {
                showToast(response.data.msg);
            });
            return promise;
        };

        newInviteCtrl.rejectInvite = function rejectInvite(event) {
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
                showToast('Cancelado');
            });
            return promise;
        };

        function deleteInvite() {
            var promise = InviteService.deleteInvite(newInviteCtrl.inviteKey);
            promise.then(function success() {
                AuthService.reload().then(function() {
                    goHome();
                });            
            }, function error(response) {
                showToast(response.data.msg);
            });
            return promise;
        }

        function goHome() {
            $state.go("app.home");
        }

        function loadInstitution() {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                newInviteCtrl.institution = response.data;
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

        function showToast(msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
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