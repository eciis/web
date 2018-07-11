'use strict';
(function() {
    var app = angular.module("app");
    app.controller("ConfigInstController", function ConfigInstController(AuthService, InstitutionService, CropImageService,$state,
            $mdToast, $mdDialog, $http, InviteService, ImageService, $rootScope, MessageService, PdfService, $q, $window,
            RequestInvitationService, brCidadesEstados, ObserverRecorderService) {

        var configInstCtrl = this;
        var institutionKey = $state.params.institutionKey;
        var currentPortfoliourl = null;
        var observer;

        configInstCtrl.loading = true;
        configInstCtrl.isSubmitting = false;
        configInstCtrl.user = AuthService.getCurrentUser();
        configInstCtrl.cnpjRegex = "[0-9]{2}[\.][0-9]{3}[\.][0-9]{3}[\/][0-9]{4}[-][0-9]{2}";
        configInstCtrl.phoneRegex = "[0-9]{2}[\\s][0-9]{4,5}[-][0-9]{4,5}";
        configInstCtrl.cepRegex = "([0-9]{5}[-][0-9]{3})";
        configInstCtrl.numberRegex = "[0-9]+$";
        configInstCtrl.newInstitution = {
            email: configInstCtrl.user.email[0]
        };
        configInstCtrl.steps = [true, false, false, false];

        configInstCtrl.descriptionGuide = "Descrever neste campo as áreas de atuação da sua instituição " +
        "considerando a missão e objetivos, os principais produtos e/ou serviços, as interfaces com os " +
        "demais atores e as articulações institucionais no âmbito do CIS(utilize palavras de destaque " +
        "que possam ser utilizadas como palavras-chave na pesquisa avançada da Plataforma CIS)";

        getLegalNatures();
        getActuationAreas();
        getCountries();

        configInstCtrl.getCitiesByState = function getCitiesByState() {
            configInstCtrl.cities = brCidadesEstados.buscarCidadesPorSigla(configInstCtrl.selectedState.sigla);
            updateAddressState();
        };

        function updateAddressState() {
            configInstCtrl.address.federal_state = configInstCtrl.selectedState && configInstCtrl.selectedState.nome;
        }

        function loadAddress() {
            configInstCtrl.newInstitution.address = new Address(configInstCtrl.newInstitution.address);
            configInstCtrl.address = configInstCtrl.newInstitution.address;
            loadCountry();
            loadStateAndCities();
        }

        function loadStateAndCities() {
            configInstCtrl.states = brCidadesEstados.estados;
            var isANewInstitution = institutionKey == undefined;
            if(!isANewInstitution) {
                var stateName = configInstCtrl.address.federal_state;
                var stateIndex = configInstCtrl.states.findIndex((state) => {
                    return state.nome === stateName;
                });
                if(stateIndex >= 0) {
                    configInstCtrl.selectedState = configInstCtrl.states[stateIndex];
                    configInstCtrl.getCitiesByState();
                }
            }
        }        
        
        function loadCountry() {
            configInstCtrl.address.country = configInstCtrl.address.country || "Brasil";
            configInstCtrl.isAnotherCountry = configInstCtrl.address.country !== "Brasil";
        }

        configInstCtrl.setAnotherCountry = function isAnotherCountry() {
            clearSelectedState();
            configInstCtrl.isAnotherCountry = configInstCtrl.address.country !== "Brasil";
        };

        function clearSelectedState() {
            configInstCtrl.selectedState = "";
        }

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

        configInstCtrl.cropImage = function cropImage(image_file, event) {
            CropImageService.crop(image_file, event).then(function success(croppedImage) {
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
            var currentStep = 3;
            if (isCurrentStepValid(currentStep) && newInstitution.isValid()){
                var confirm = $mdDialog.confirm(event)
                    .clickOutsideToClose(true)
                    .title('Finalizar')
                    .textContent('Você deseja finalizar e salvar os dados da instituição?')
                    .ariaLabel('Finalizar')
                    .targetEvent(event)
                    .ok('Sim')
                    .cancel('Não');

                promise = $mdDialog.show(confirm);
                promise.then(function success() {
                    configInstCtrl.loadingSaveInstitution = true;
                    updateInstitution();
                }, function error() {
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
                configInstCtrl.isSubmitting = true;
                ImageService.saveImage(configInstCtrl.photo_instituicao).then(
                    function success(data) {
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

        configInstCtrl.clearPortfolioUrl = function clearPortfolioUrl() {
            configInstCtrl.newInstitution.portfolio_url = "";
        };

        function updateInstitution() {
            configInstCtrl.isSubmitting = true;
            var savePromises = [savePortfolio(), saveImage()];
            var promise = $q.defer();
            $q.all(savePromises).then(function success() {
                configInstCtrl.isSubmitting = false;
                if(configInstCtrl.isSubmission) {
                    saveRequestInst();
                } else {
                    updateStubAndApplyPatch();
                }
                $q.resolve(promise);
            }, function error(response) {
                configInstCtrl.isSubmitting = false;
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
                    });
            } else {
                patchIntitution();
            }
        }

        function updateStubInstitution() {
            var inviteKey = $state.params.inviteKey;
            var promise;
            if (inviteKey) {
                var body = {sender_name: $state.params.senderName};
                promise = InstitutionService.save(body, institutionKey, inviteKey);
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
            configInstCtrl.user.name = $state.params.senderName;
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
                color: 'teal'
            };
        }

        

        function patchIntitution() {
            var patch = ObserverRecorderService.generate(observer);
            InstitutionService.update(institutionKey, patch).then(
                function success() {
                    if(configInstCtrl.newInstitution)
                        updateUserInstitutions(configInstCtrl.newInstitution);
                });
        }

        function saveRequestInst() {
            RequestInvitationService.sendRequestInst(configInstCtrl.newInstitution).then(
                function success() {
                    MessageService.showToast("Pedido enviado com sucesso!");
                    configInstCtrl.nextStep();
            });
        }

        function updateUserInstitutions(institution) {
            configInstCtrl.user.updateInstitutions(institution);
            configInstCtrl.user.updateInstProfile(institution);
            AuthService.save();
            changeInstitution(institution);
            configInstCtrl.loadingSaveInstitution = false;
            MessageService.showToast('Dados da instituição salvos com sucesso.');
            showHierarchyDialog(institution);
            $state.go('app.user.home');
        }

        configInstCtrl.showImage = function showImage() {
            return configInstCtrl.newInstitution.photo_url !== "app/images/institution.png" && !_.isEmpty(configInstCtrl.newInstitution.photo_url);
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

        configInstCtrl.getPortfolioButtonMessage = function getPortfolioButtonMessage () {
            if(configInstCtrl.newInstitution.portfolio_url || configInstCtrl.file) {
                return "Trocar Portfólio";
            } else {
                return "Adicionar Portfólio";
            }
        };

        configInstCtrl.getPortfolioButtonIcon = function getPortfolioButtonIcon() {
            if (configInstCtrl.newInstitution.portfolio_url || configInstCtrl.file) {
                return "insert_drive_file";
            } else {
                return "attach_file";
            }
        };

        configInstCtrl.goToLandingPage = function goToLandingPage() {
            AuthService.logout();
            $window.open(Config.LANDINGPAGE_URL, '_self');
        };

        function getFields() {
            var necessaryFieldsForStep = {
                0: {
                    fields: [configInstCtrl.newInstitution.address],
                    isValid :  configInstCtrl.isValidAddress
                },
                1: {
                    fields: [
                    configInstCtrl.newInstitution.name,
                    configInstCtrl.newInstitution.actuation_area,
                    configInstCtrl.newInstitution.legal_nature,
                    configInstCtrl.newInstitution.institutional_email
                    ]
                },
                2: {
                    fields: [
                    configInstCtrl.newInstitution.leader,
                    configInstCtrl.newInstitution.description
                    ]
                },
                3: {
                    fields: [
                    configInstCtrl.newInstitution.description,
                    configInstCtrl.newInstitution.leader
                    ]
                }
            };
            if(configInstCtrl.isSubmission) {
                necessaryFieldsForStep[3].fields.push(configInstCtrl.newInstitution.admin.name);
            }
            return necessaryFieldsForStep;
        }

        configInstCtrl.isValidAddress =  function isValidAddress(){       
            var valid = true;
            var address = configInstCtrl.address;
            if(address && address.country === "Brasil"){    
                _.forEach(address, function(value, key) {
                    var isNotNumber =  key !== "number";
                    (isNotNumber && _.isEmpty(value)) ? valid = false : '';
                });       
            }     
            return valid;     
         };     

        function isCurrentStepValid(currentStep) {
            var isValid = true;
            var isFieldValid = true;
            var necessaryFieldsForStep = getFields();
            _.forEach(necessaryFieldsForStep[currentStep].fields, function(field) {
                if(_.isUndefined(field) || _.isEmpty(field)) {
                    isValid = false;
                }
            });
            isFieldValid = necessaryFieldsForStep[currentStep].isValid ? 
                necessaryFieldsForStep[currentStep].isValid() : true;
            return isValid && isFieldValid;
        }

        function changeInstitution(institution) {
            if(configInstCtrl.newInstitution &&
                configInstCtrl.user.current_institution.key === configInstCtrl.newInstitution.key) {
                configInstCtrl.user.changeInstitution(institution);
            }
        }

        function getLegalNatures() {
            InstitutionService.getLegalNatures().then(function success(response) {
                configInstCtrl.legalNatures = response;
            });
        }

        function getActuationAreas() {
            InstitutionService.getActuationAreas().then(function success(response) {
                configInstCtrl.actuationArea = response;
            });
        }

        function getCountries() {
            $http.get('app/institution/countries.json').then(function success(response) {
                configInstCtrl.countries = response.data;
            });
        }

        function loadInstitution() {
            InstitutionService.getInstitution(institutionKey).then(function success(response) {
                configInstCtrl.newInstitution = response;
                configInstCtrl.suggestedName = configInstCtrl.newInstitution.name;
                currentPortfoliourl = configInstCtrl.newInstitution.portfolio_url;
                observer = ObserverRecorderService.register(configInstCtrl.newInstitution);
                loadAddress(); 
                setDefaultPhotoUrl();
                configInstCtrl.loading = false;
            }, function error() {
                configInstCtrl.loading = true;
            });
        }

        function setDefaultPhotoUrl() {
            var defaultPhotoUrl = "app/images/institution.png";
            configInstCtrl.newInstitution.photo_url = configInstCtrl.newInstitution.photo_url || defaultPhotoUrl;
        }

        function hasPendingInstInvite() {
            return !_.isEmpty(configInstCtrl.user.invites
                .filter(invite => invite.type_of_invite === "INSTITUTION" && invite.status === "sent"));
        }

        function isRequest() {
            return configInstCtrl.user.state !== "active" && !hasPendingInstInvite();
        }

        function loadRequestState() {
            configInstCtrl.isSubmission = true;
            configInstCtrl.newInstitution.admin = {};
            loadAddress();
        }

        function showHierarchyDialog(institution) {
            if (hasChildren(institution)) {
                $mdDialog.show({
                    templateUrl: 'app/institution/created_hierarchical_institution_dialog.html',
                    clickOutsideToClose: true,
                    locals: {
                        institution: institution
                    },
                    controller: 'HierarchicalInstitutionDialogController',
                    controllerAs: 'hierCtrl'
                });
            }
        }

        function hasChildren(institution) {
            return !_.isEmpty(institution.children_institutions);
        }

        configInstCtrl.initController = function initController() {
            if (configInstCtrl.institutionKey) {
                loadInstitution();
            } else if(isRequest()) {
                loadRequestState();
            } else {
                $state.go('signin');
            }
        };

        (function main(){
            configInstCtrl.institutionKey = institutionKey;
            configInstCtrl.initController();
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