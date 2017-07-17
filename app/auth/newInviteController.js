'use strict';

(function() {
   var app = angular.module('app');

   app.controller('NewInviteController', function NewInviteController(InstitutionService, AuthService, UserService, InviteService, $state, $mdToast,
    $mdDialog, $rootScope) {
        var newInviteCtrl = this;

        newInviteCtrl.institution = null;

        newInviteCtrl.inviteKey = $state.params.inviteKey;

        newInviteCtrl.newUser = {};

        var institutionKey = $state.params.institutionKey;

        Object.defineProperty(newInviteCtrl, 'user', {
            get: function() {
                return AuthService.user;
            },
            set: function set(newValue) {
                AuthService.user = newValue;
            }
        });

        newInviteCtrl.acceptInvite = function acceptInvite(event) {
            var promise = UserService.addInstitution(newInviteCtrl.user, newInviteCtrl.institution.key);
            promise.then(function success(response) {
                    newInviteCtrl.user = new User(response);
                // UserService.save(newInviteCtrl.user, newInviteCtrl.newUser).then(function success(data) {
                //     newInviteCtrl.user = new User(data);
                // });
                deleteInvite();
                showAlert(event, newInviteCtrl.institution.name);
            }, function error(response) {
                showToast(response.data.msg);
            });
            return promise;
        };

        newInviteCtrl.rejectInvite = function rejectInvite(event) {
            var confirm = $mdDialog.confirm()
                            .clickOutsideToClose(false)
                            .title('Rejeitar convite')
                            .textContent("Ao rejeitar o convite, você só poderá ser membro com um novo convite." +
                                 " Deseja rejeitar mesmo assim?")
                            .ariaLabel('Rejeitar convite')
                            .targetEvent(event)
                            .ok('Sim')
                            .cancel('Não');
                        $mdDialog.show(confirm).then(function() {
                            deleteInvite();
                        }, function() {
                            showToast('Cancelado');
                        });
        };

        function deleteInvite() {
            var promise = InviteService.deleteInvite(newInviteCtrl.inviteKey);
            promise.then(function success() {
                goHome();            
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

        if (newInviteCtrl.user) {
            setupUser();
        } else {
            // In case of refresh
            $rootScope.$on("user_loaded", function() {
                if (newInviteCtrl.user) {
                    setupUser();
                }
            });
        }

        function setupUser() {
            newInviteCtrl.newUser = new User(newInviteCtrl.user);
        }

        loadInstitution();
   });
})();