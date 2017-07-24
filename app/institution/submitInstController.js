'use strict';

(function() {
    var app = angular.module("app");

    app.controller("SubmitInstController", function SubmitInstController(AuthService, InstitutionService, $state, $mdToast, $mdDialog, $http, InviteService) {
        var submitInstCtrl = this;
        var institutionKey = $state.params.institutionKey;
        var observer;

        Object.defineProperty(submitInstCtrl, 'user', {
            get: function() {
                return AuthService.user;
            },
        });

        submitInstCtrl.invite = submitInstCtrl.user.getPendingInvitationOf('institution');
        submitInstCtrl.newInstitution = {};
        submitInstCtrl.newInstitution.photo_url = "/images/institution.jpg";

        getLegalNatures();
        getOccupationAreas();
        submitInstCtrl.cnpjRegex = "[0-9]{2}[\.][0-9]{3}[\.][0-9]{3}[\/][0-9]{4}[-][0-9]{2}";
        submitInstCtrl.phoneRegex = "([0-9]{2}[\\s][0-9]{8})";

        submitInstCtrl.submit = function submit() {
            var confirm = $mdDialog.confirm(event)
                .clickOutsideToClose(true)
                .title('Confirmar Cadastro')
                .textContent('Confirmar o cadastro dessa instituição?')
                .ariaLabel('Confirmar Cadastro')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');
            $mdDialog.show(confirm).then(function() {
                submitInstCtrl.newInstitution.uploaded_images = [];
                var patch = jsonpatch.generate(observer);
                InstitutionService.save(institutionKey, patch, submitInstCtrl.invite.key).then(
                    reloadUser(),
                    function error(response) {
                        showToast(response.data.msg);
                    });
                }, function() {
                    showToast('Cancelado');
                });
        };

        function reloadUser() {     
            AuthService.reload().then(function(){     
                showToast('Cadastro de instituição realizado com sucesso');
                AuthService.logout();  
            });                        
        }

        submitInstCtrl.cancel = function cancel(event) {
            var confirm = $mdDialog.confirm()
                .clickOutsideToClose(true)
                .title('Cancelar Cadastro')
                .textContent("Ao cancelar o cadastro, seu convite será removido e " +
                    "a instituição não poderá ser criada posteriormente sem um novo convite. " +
                    "Deseja cancelar mesmo assim?")
                .ariaLabel('Cancelar Cadastro')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');

            $mdDialog.show(confirm).then(function() {
                InviteService.deleteInvite(submitInstCtrl.invite.key).then(
                    function success() {          
                        showToast('Cadastro de instituição cancelado');
                        AuthService.logout();
                    }, function error(response) {
                        showToast(response.data.msg);
                    }
                );
            }, function() {
                showToast('Cancelado');
            });
        };

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

        function getLegalNatures() {
            $http.get('institution/legal_nature.json').then(function success(response) {
                submitInstCtrl.legalNatures = response.data;
            });
        }

        function getOccupationAreas() {
            $http.get('institution/occupation_area.json').then(function success(response) {
                submitInstCtrl.occupationAreas = response.data;
            });
        }

        function loadInstitution() {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                submitInstCtrl.newInstitution = response.data;
                observer = jsonpatch.observe(submitInstCtrl.newInstitution);
            }, function error(response) {
                showToast(response.data.msg);
            });
        }

        loadInstitution();
    });
})();
