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
            var promise = ImageService.compress(image, newSize);

            promise.then(function success(data) {
                editInstCtrl.photo_instituicao = data;
                ImageService.readFile(data, setImage);
                editInstCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
            return promise;
        };

        function setImage(image) {
            $rootScope.$apply(function() {
                editInstCtrl.newInstitution.photo_url = image.src;
            });
        }

        editInstCtrl.newInstitution = {};
        editInstCtrl.newInstitution.photo_url = "/images/institution.jpg";

        getLegalNatures();
        getOccupationAreas();

        editInstCtrl.cnpjRegex = "[0-9]{2}[\.][0-9]{3}[\.][0-9]{3}[\/][0-9]{4}[-][0-9]{2}";
        editInstCtrl.phoneRegex = "([0-9]{2}[\\s][0-9]{8})";

        editInstCtrl.submit = function submit(event) {
            var confirm = $mdDialog.confirm(event)
                .clickOutsideToClose(true)
                .title('Confirmar Edição')
                .textContent('Confirmar a edição dessa instituição?')
                .ariaLabel('Confirmar Edição')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');
            var promise = $mdDialog.show(confirm);
            promise.then(function() {
                if (editInstCtrl.photo_instituicao) {
                    saveImage();
                } else {
                    updateInstitution();
                }
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        function saveImage() {
            editInstCtrl.loading = true;
            var promise = ImageService.saveImage(editInstCtrl.photo_instituicao);
            promise.then(function(data) {
                editInstCtrl.loading = false;
                editInstCtrl.newInstitution.photo_url = data.url;
                updateInstitution();
            });
            return promise;
        }

        function updateInstitution() {
            var patch = jsonpatch.generate(observer);
            var promise = InstitutionService.update(institutionKey, patch);
            promise.then(function success() {
                updateUserInstitutions(editInstCtrl.newInstitution);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }

        function updateUserInstitutions(institution) {
            editInstCtrl.user.updateInstitutions(institution);
            AuthService.save();
            changeInstitution(institution);
            MessageService.showToast('Edição de instituição realizado com sucesso');
            $state.go('app.institution', {institutionKey: institutionKey});
        }
        
        editInstCtrl.showButton = function() {
            return !editInstCtrl.loading;
        };

        function changeInstitution(institution) {
            if(editInstCtrl.newInstitution &&
                editInstCtrl.user.current_institution.key === editInstCtrl.newInstitution.key) {
                editInstCtrl.user.changeInstitution(institution);
            }
        }

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

    app.directive("editInstitution", function() {
        return {
            restrict: 'E',
            templateUrl: "institution/submit_form.html",
            controller: "EditInstController",
            controllerAs: "editInstCtrl",
            scope: {
                isSubmission: '=',
            }
        };
    });
})();