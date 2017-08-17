'use strict';
(function() {
    var app = angular.module("app");
    app.controller("EditInstController", function EditInstController(AuthService, InstitutionService, $state, 
            $mdToast, $mdDialog, $http, InviteService, ImageService, $rootScope, MessageService, PdfService, $q) {

        var editInstCtrl = this;
        var institutionKey = $state.params.institutionKey;
        var observer;

        editInstCtrl.loading = false;
        editInstCtrl.user = AuthService.getCurrentUser();
        editInstCtrl.newInstitution = {
            photo_url: "/images/institution.jpg"
        };
        editInstCtrl.cnpjRegex = "[0-9]{2}[\.][0-9]{3}[\.][0-9]{3}[\/][0-9]{4}[-][0-9]{2}";
        editInstCtrl.phoneRegex = "([0-9]{2}[\\s][0-9]{8})";
        var currentPortfoliourl = null;

        getLegalNatures();
        getOccupationAreas();

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
                updateInstitution();
            }, function() {
                MessageService.showToast('Cancelado');
            });
            return promise;
        };

        function saveImage() {
            var promise = $q.defer();
            if(editInstCtrl.photo_instituicao) {
                editInstCtrl.loading = true;
                ImageService.saveImage(editInstCtrl.photo_instituicao).then(
                    function(data) {
                        editInstCtrl.loading = false;
                        editInstCtrl.newInstitution.photo_url = data.url;
                        $q.resolve(promise);
                    }, function error() {
                        $q.reject(promise);
                });
            } else {
                $q.resolve(promise);
            }
            return promise;
        }

        function updateInstitution() {
            var savePromises = [savePortfolio(), saveImage()];
            var promise = $q.defer();
            $q.all(savePromises).then(function success() {
                var patch = jsonpatch.generate(observer);
                InstitutionService.update(institutionKey, patch).then(
                    function success() {
                        updateUserInstitutions(editInstCtrl.newInstitution);
                        $q.resolve(promise);
                    },
                    function error(response) {
                        MessageService.showToast(response.data.msg);
                        $q.reject(promise);
                });                
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                $q.reject(promise);
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

        editInstCtrl.addPortfolio = function addPortfolio() {
            MessageService.showToast("Portfólio adicionado");
        };

        function savePortfolio() {
            var promise = $q.defer();
            if(editInstCtrl.file) {
                PdfService.save(editInstCtrl.file, currentPortfoliourl).then(
                    function success(data) {
                        editInstCtrl.newInstitution.portfolio_url = data.url;
                        currentPortfoliourl = data.url;
                        console.log(data.url);
                        $q.resolve(promise);
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                        $q.reject(promise);
                });
            } else {
                $q.resolve(promise);
            }
            return promise;
        }

        function loadInstitution() {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                editInstCtrl.newInstitution = response.data;
                currentPortfoliourl = editInstCtrl.newInstitution.portfolio_url;
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