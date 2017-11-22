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
            photo_url: "app/images/institution.jpg",
            email: configInstCtrl.user.email[0]
        };
        configInstCtrl.steps = [true, false, false];

        getLegalNatures();
        getActuationAreas();

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
                    .title('Finalizar')
                    .textContent('Você deseja finalizar e salvar os dados da instituição?')
                    .ariaLabel('Finalizar')
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
                    updateStubAndApplyPatch();
                }
                $q.resolve(promise);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
                $q.reject(promise);
            });
            return promise;
        }

        function updateStubAndApplyPatch() {
            var updateStubPromise = updateStubInstitution();
            if (updateStubPromise) {
                updateStubPromise.then(
                    function success(institutionSaved) {
                        updateUser($state.params.inviteKey, institutionSaved);
                        patchIntitution();
                    },
                    function error(response) {
                        MessageService.showToast(response.data.msg);
                });
            } else {
                patchIntitution();
            }
        }

        function updateStubInstitution() {
            var inviteKey = $state.params.inviteKey;
            var promise;
            if (inviteKey) {
                promise = InstitutionService.save($state.params.dataProfile, institutionKey, inviteKey);
            }
            return promise;
        }

        function updateUser(inviteKey, institution) {
            configInstCtrl.user.removeInvite(inviteKey);
            configInstCtrl.user.institutions.push(institution);
            configInstCtrl.user.institutions_admin.push(institution.key);
            configInstCtrl.user.follow(institution);
            configInstCtrl.user.addProfile(createProfile(institution));
            configInstCtrl.user.changeInstitution(institution);
            configInstCtrl.user.state = 'active';
            configInstCtrl.user.name = getCurrentName();
            AuthService.save();
        }

        function createProfile(new_institution) {
            return {
                email: null,
                institution_key: new_institution.key,
                institution: {
                    name: new_institution.name,
                    photo_url: new_institution.photo_url,
                },
                office: 'Administrador',
                phone: null,
                color: 'grey'
            };
        }

        function getCurrentName() {
            console.log(configInstCtrl.user_name);
            return configInstCtrl.user_name ? configInstCtrl.user_name : configInstCtrl.user.name;
        }

        function patchIntitution() {
            var patch = jsonpatch.generate(observer);
            console.log(patch);
            console.log(configInstCtrl.newInstitution);
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
            MessageService.showToast('Dados da instituição salvos com sucesso.');
            $state.go('app.institution', {institutionKey: institutionKey});
        }

        configInstCtrl.showButton = function() {
            return !configInstCtrl.loading;
        };

        configInstCtrl.showImage = function showImage() {
            return configInstCtrl.newInstitution.photo_url !== "app/images/institution.jpg" && !_.isEmpty(configInstCtrl.newInstitution.photo_url);
        };

        configInstCtrl.getStep = function getStep(step) {
            return configInstCtrl.steps[step - 1];
        };

        configInstCtrl.showGreenButton = function showGreenButton(step) {
            if(step === 2) {
                return configInstCtrl.getStep(2) || configInstCtrl.getStep(3);
            } else {
                return configInstCtrl.getStep(3);
            }
        };

        configInstCtrl.nextStep = function nextStep() {
            var currentStep = _.findIndex(configInstCtrl.steps, function(situation) {
                return situation;
            });
            if(isCurrentStepValid(currentStep)) {
                configInstCtrl.steps[currentStep] = false;
                var nextStep = currentStep + 1;
                configInstCtrl.steps[nextStep] = true;
            } else {
                MessageService.showToast("Campos obrigatórios não preenchidos corretamente.");
            }
        };

        function getFields() {
            var necessaryFieldsForStep = {
                0: {fields: [configInstCtrl.newInstitution.address], size: 7},
                1: {fields: [
                    configInstCtrl.newInstitution.name,
                    configInstCtrl.newInstitution.acronym,
                    configInstCtrl.newInstitution.actuation_area,
                    configInstCtrl.newInstitution.legal_nature
                    ]},
                2: {fields: [configInstCtrl.newInstitution.leader]}
            };
            return necessaryFieldsForStep;
        }

        function isCurrentStepValid(currentStep) {
            var isValid = true;
            var necessaryFieldsForStep = getFields();
            _.forEach(necessaryFieldsForStep[currentStep].fields, function(field) {
                if(_.isUndefined(field) || _.isEmpty(field)) {
                    isValid = false;
                }
            });
            var size = necessaryFieldsForStep[currentStep].size;
            if(size)
                isValid = _.size(necessaryFieldsForStep[currentStep].fields[0]) === size;
            return isValid;
        }

        function changeInstitution(institution) {
            if(configInstCtrl.newInstitution &&
                configInstCtrl.user.current_institution.key === configInstCtrl.newInstitution.key) {
                configInstCtrl.user.changeInstitution(institution);
            }
        }

        function getLegalNatures() {
            $http.get('app/institution/legal_nature.json').then(function success(response) {
                configInstCtrl.legalNatures = response.data;
            });
        }

        function getActuationAreas() {
            $http.get('app/institution/actuation_area.json').then(function success(response) {
                configInstCtrl.actuationArea = response.data;
            });
        }

        function loadInstitution() {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                configInstCtrl.newInstitution = response.data;
                configInstCtrl.suggestedName = configInstCtrl.newInstitution.name;
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