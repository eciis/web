'use strict';

(function() {
    var app = angular.module("app");

    app.controller("SubmitInstController", function SubmitInstController(AuthService, InstitutionService, $state, $mdToast, $mdDialog, $http, InviteService) {
        var submitInstCtrl = this;

        Object.defineProperty(submitInstCtrl, 'user', {
            get: function() {
                return AuthService.user;
            },
        });

        submitInstCtrl.invite = submitInstCtrl.user.getPendingInvitationOf('institution');

        submitInstCtrl.institution = {
            name: submitInstCtrl.invite.suggestion_institution_name,
            photo_url: "/images/institution.jpg",
            uploaded_images: [],
            email: submitInstCtrl.invite.invitee,
            state: "active"
        };

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
                InstitutionService.createInstitution(submitInstCtrl.institution).then(
                    function success() {
                        InviteService.deleteInvite(submitInstCtrl.invite.key).then(
                            function success() {
                                goHome();
                                showToast('Cadastro de instituição realizado com sucesso');
                            }, function error(response) {
                                showToast(response.data.msg);
                            }
                        );
                    }, function error(response) {
                        showToast(response.data.msg);
                    }
                );
            }, function() {
                showToast('Cancelado');
            });
        };

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
                        goHome();
                        showToast('Cadastro de instituição cancelado');
                    }, function error(response) {
                        showToast(response.data.msg);
                    }
                );
            }, function() {
                showToast('Cancelado');
            });
        };

        var goHome = function goToHome() {
            $state.go('app.home');
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
    });
})();
