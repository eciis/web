'use strict';
(function() {
    var app = angular.module("app");
    app.controller("ConfigInstController", function ConfigInstController(AuthService, InstitutionService, CropImageService,$state,
            $mdToast, $mdDialog, $http, InviteService, ImageService, $rootScope, MessageService, PdfService, $q, RequestInvitationService) {

        var configInstCtrl = this;
        var institutionKey = $state.params.institutionKey;
        var currentPortfoliourl = null;
        var observer;

        configInstCtrl.loading = false;
        configInstCtrl.user = AuthService.getCurrentUser();
        configInstCtrl.cnpjRegex = "[0-9]{2}[\.][0-9]{3}[\.][0-9]{3}[\/][0-9]{4}[-][0-9]{2}";
        configInstCtrl.phoneRegex = "[0-9]{2}[\\s][0-9]{4,5}[-][0-9]{4,5}";
        configInstCtrl.cepRegex = "([0-9]{5}[-][0-9]{3})";
        configInstCtrl.newInstitution = {
            photo_url: "/images/institution.jpg",
            email: configInstCtrl.user.email[0]
        };

        getLegalNatures();
        getOccupationAreas();

        configInstCtrl.addImage = function addImage(image) {
            var newSize = 800;
            var promise = ImageService.compress(image, newSize);
            promise.then(function success(data) {
                configInstCtrl.photo_instituicao = data;
                ImageService.readFile(data, setImage);
                configInstCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
            return promise;
        };

        configInstCtrl.cropImage = function cropImage(image_file) {
            CropImageService.crop(image_file).then(function success(croppedImage) {
                configInstCtrl.addImage(croppedImage);
            }, function error() {
                configInstCtrl.file = null;
            });
        };

        function setImage(image) {
            $rootScope.$apply(function() {
                configInstCtrl.newInstitution.photo_url = image.src;
            });
        }

        configInstCtrl.submit = function submit(event) {
            var newInstitution = new Institution(configInstCtrl.newInstitution);
            var promise;
            if (newInstitution.isValid()){
                var confirm = $mdDialog.confirm(event)
                    .clickOutsideToClose(true)
                    .title('Confirmar Edição')
                    .textContent('Confirmar a edição dessa instituição?')
                    .ariaLabel('Confirmar Edição')
                    .targetEvent(event)
                    .ok('Sim')
                    .cancel('Não');

                promise = $mdDialog.show(confirm);
                promise.then(function() {
                    updateInstitution();
                }, function() {
                    MessageService.showToast('Cancelado');
                });
            } else {
                MessageService.showToast("Campos obrigatórios não preenchidos corretamente.");
            }
            return promise;
        };

        function saveImage() {
            var defer = $q.defer();
            if(configInstCtrl.photo_instituicao) {
                configInstCtrl.loading = true;
                ImageService.saveImage(configInstCtrl.photo_instituicao).then(
                    function(data) {
                        configInstCtrl.loading = false;
                        configInstCtrl.newInstitution.photo_url = data.url;
                        defer.resolve();
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                        defer.reject();
                });
            } else {
                defer.resolve();
            }
            return defer.promise;
        }

        function savePortfolio() {
            var defer = $q.defer();
            if(configInstCtrl.file) {
                PdfService.save(configInstCtrl.file, currentPortfoliourl).then(
                    function success(data) {
                        configInstCtrl.newInstitution.portfolio_url = data.url;
                        currentPortfoliourl = data.url;
                        defer.resolve();
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                        defer.reject();
                });
            } else {
                defer.resolve();
            }
            return defer.promise;
        }

        function updateInstitution() {
            var savePromises = [savePortfolio(), saveImage()];
            var promise = $q.defer();
            $q.all(savePromises).then(function success() {
                if(configInstCtrl.isSubmission) {
                    saveRequestInst();
                } else {
                    patchIntitution();
                }
                $q.resolve(promise);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                $q.reject(promise);
            });
            return promise;
        }

        function patchIntitution() {
            var patch = jsonpatch.generate(observer);
            InstitutionService.update(institutionKey, patch).then(
                function success() {
                    updateUserInstitutions(configInstCtrl.newInstitution);
                },
                function error(response) {
                    MessageService.showToast(response.data.msg);
            });
        }

        function saveRequestInst() {
            RequestInvitationService.sendRequestInst(configInstCtrl.newInstitution).then(
                function success() {
                    MessageService.showToast("Pedido enviado com sucesso!");
                    $state.go('user_inactive');
                });
        }

        function updateUserInstitutions(institution) {
            configInstCtrl.user.updateInstitutions(institution);
            AuthService.save();
            changeInstitution(institution);
            MessageService.showToast('Edição de instituição realizado com sucesso');
            $state.go('app.institution', {institutionKey: institutionKey});
        }

        configInstCtrl.showButton = function() {
            return !configInstCtrl.loading;
        };

        function changeInstitution(institution) {
            if(configInstCtrl.newInstitution &&
                configInstCtrl.user.current_institution.key === configInstCtrl.newInstitution.key) {
                configInstCtrl.user.changeInstitution(institution);
            }
        }

        function getLegalNatures() {
            $http.get('institution/legal_nature.json').then(function success(response) {
                configInstCtrl.legalNatures = response.data;
            });
        }

        function getOccupationAreas() {
            $http.get('institution/occupation_area.json').then(function success(response) {
                configInstCtrl.occupationAreas = response.data;
            });
        }

        function loadInstitution() {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                configInstCtrl.newInstitution = response.data;
                currentPortfoliourl = configInstCtrl.newInstitution.portfolio_url;
                observer = jsonpatch.observe(configInstCtrl.newInstitution);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
        }

        (function main(){
            if (institutionKey) {
                loadInstitution();
            }
        })();
    });

    app.directive("configInstitution", function() {
        return {
            restrict: 'E',
            templateUrl: "app/institution/submit_form.html",
            controller: "ConfigInstController",
            controllerAs: "configInstCtrl",
            scope: {},
            bindToController: {
                isSubmission: '='
            }
        };
    });
})();