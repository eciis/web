'use strict';

(function() {
    var app = angular.module("app");

    app.controller("SubmitInstController", function SubmitInstController(AuthService, InstitutionService, $state, $mdToast, $mdDialog, $http, InviteService, ImageService, $rootScope, MessageService) {
        var submitInstCtrl = this;
        var institutionKey = $state.params.institutionKey;
        var observer;

        submitInstCtrl.loading = false;
        Object.defineProperty(submitInstCtrl, 'user', {
            get: function() {
                return AuthService.user;
            },
        });

        submitInstCtrl.addImage = function(image) {
            var newSize = 800;

            ImageService.compress(image, newSize).then(function success(data) {
                submitInstCtrl.photo_instituicao = data;
                ImageService.readFile(data, setImage);
                submitInstCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
        };

        function setImage(image) {
            $rootScope.$apply(function() {
                submitInstCtrl.newInstitution.photo_url = image.src;
            });
        }

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
                if (submitInstCtrl.photo_instituicao) {
                    saveImage();
                } else {
                    saveInstitution();
                }
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };

        function saveImage() {
            submitInstCtrl.loading = true;
            ImageService.saveImage(submitInstCtrl.photo_instituicao).then(function(data) {
                submitInstCtrl.loading = false;
                submitInstCtrl.newInstitution.photo_url = data.url;
                saveInstitution();
            });
        }

        function saveInstitution() {
            var patch = jsonpatch.generate(observer);
            InstitutionService.save(institutionKey, patch, submitInstCtrl.invite.key).then(
                reloadUser(),
                function error(response) {
                    MessageService.showToast(response.data.msg);
            });
        }

        function reloadUser() {
            AuthService.reload().then(function(){
                MessageService.showToast('Cadastro de instituição realizado com sucesso');
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

        submitInstCtrl.showButton = function() {
            return !submitInstCtrl.loading;
        };

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
                MessageService.showToast(response.data.msg);
            });
        }

        (function main(){
             loadInstitution();
        })();
    });
})();
