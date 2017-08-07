'use strict';

(function() {
    var app = angular.module("app");

    app.controller("SubmitInstController", function SubmitInstController(AuthService, InstitutionService, $state, $mdToast, $mdDialog, $http, InviteService, ImageService, $rootScope, MessageService) {
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
                saveInstitution();
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };

        function saveInstitution() {
            var patch = jsonpatch.generate(observer);
            InstitutionService.save(institutionKey, patch, submitInstCtrl.invite.key).then(
                function success(response){
                    MessageService.showToast('Cadastro de instituição realizado com sucesso');
                    submitInstCtrl.user.removeInvite(submitInstCtrl.invite);
                    submitInstCtrl.user.follow(response);
                    submitInstCtrl.user.institutions.push(response);
                    submitInstCtrl.user.current_institution = response;
                    submitInstCtrl.user.state = 'active';
                    AuthService.save();
                    $state.go('app.manage_institution.edit_info', {institutionKey: response.key});
                },
                function error(response) {
                    MessageService.showToast(response.data.msg);
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
                        MessageService.showToast('Cadastro de instituição cancelado');
                        AuthService.logout();
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                    }
                );
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };

        function loadInstitution() {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                submitInstCtrl.newInstitution = response.data;
                observer = jsonpatch.observe(submitInstCtrl.newInstitution);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        (function main(){
             loadInstitution();
        })();
    });
})();
