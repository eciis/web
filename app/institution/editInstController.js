'use strict';
(function() {
    var app = angular.module("app");
    app.controller("EditInstController", function EditInstController(AuthService, InstitutionService, $state, $mdToast, $mdDialog, $http, InviteService, ImageService, $rootScope, MessageService) {
        var editInstCtrl = this;
        var institutionKey = $state.params.institutionKey;
        var observer;
        editInstCtrl.loading = false;
        editInstCtrl.user = AuthService.getCurrentUser();
        editInstCtrl.addImage = function(image) {
            var newSize = 800;
            ImageService.compress(image, newSize).then(function success(data) {
                editInstCtrl.photo_instituicao = data;
                ImageService.readFile(data, setImage);
                editInstCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
        };
        function setImage(image) {
            $rootScope.$apply(function() {
                editInstCtrl.newInstitution.photo_url = image.src;
            });
        }
        editInstCtrl.invite = editInstCtrl.user.getPendingInvitationOf('institution');
        editInstCtrl.newInstitution = {};
        editInstCtrl.newInstitution.photo_url = "/images/institution.jpg";
        getLegalNatures();
        getOccupationAreas();
        editInstCtrl.cnpjRegex = "[0-9]{2}[\.][0-9]{3}[\.][0-9]{3}[\/][0-9]{4}[-][0-9]{2}";
        editInstCtrl.phoneRegex = "([0-9]{2}[\\s][0-9]{8})";
        editInstCtrl.submit = function submit() {
            var confirm = $mdDialog.confirm(event)
                .clickOutsideToClose(true)
                .title('Confirmar Cadastro')
                .textContent('Confirmar o cadastro dessa instituição?')
                .ariaLabel('Confirmar Cadastro')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');
            $mdDialog.show(confirm).then(function() {
                if (editInstCtrl.photo_instituicao) {
                    saveImage();
                } else {
                    saveInstitution();
                }
            }, function() {
                MessageService.showToast('Cancelado');
            });
        };
        function saveImage() {
            editInstCtrl.loading = true;
            ImageService.saveImage(editInstCtrl.photo_instituicao).then(function(data) {
                editInstCtrl.loading = false;
                editInstCtrl.newInstitution.photo_url = data.url;
                saveInstitution();
            });
        }
        function saveInstitution() {
            var patch = jsonpatch.generate(observer);
            InstitutionService.save(institutionKey, patch, editInstCtrl.invite.key).then(
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
        editInstCtrl.cancel = function cancel(event) {
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
                InviteService.deleteInvite(editInstCtrl.invite.key).then(
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
        editInstCtrl.showButton = function() {
            return !editInstCtrl.loading;
        };
        function getLegalNatures() {
            $http.get('institution/legal_nature.json').then(function success(response) {
                editInstCtrl.legalNatures = response.data;
            });
        }
        function getOccupationAreas() {
            $http.get('institution/occupation_area.json').then(function success(response) {
                editInstCtrl.occupationAreas = response.data;
            });
        }
        function loadInstitution() {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                editInstCtrl.newInstitution = response.data;
                observer = jsonpatch.observe(editInstCtrl.newInstitution);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }
        (function main(){
             loadInstitution();
        })();
    });
})();