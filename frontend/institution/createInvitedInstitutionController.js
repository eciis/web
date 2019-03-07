'use strict';
(function() {
  angular.module('app')
    .controller('CreateInvitedInstitutionController',
      ['STATES', '$state', 'AuthService', 'InstitutionService', 'MessageService',
        function (STATES, $state, AuthService, InstitutionService, MessageService) {
          const ctrl = this;
          ctrl.loading = true;
          ctrl.currentStep = 0;
          ctrl.newInstitution = {};

          ctrl.stepColor = (step) => {
            return ctrl.currentStep === step ? 'light-green-500' : 'grey-500';
          };

          ctrl.backButton = () => {
            ctrl.currentStep === 0 ? window.history.back() : ctrl.previousStep();
          }

          // loadInstitution
          ctrl.loadInstitution = () => {
            InstitutionService.getInstitution(ctrl.institutionKey).then(res => {
              ctrl.newInstitution = res;
              ctrl.suggestedName = res.name;

              // Set default values
              ctrl.newInstitution.address = new Address(res.address);
              ctrl.newInstitution.address.country = ctrl.newInstitution.address.country || 'Brasil';
              ctrl.newInstitution.photo_url = ctrl.newInstitution.photo_url || 'app/images/institution.png';
              ctrl.loading = false;
            }, e => {
              ctrl.loading = true;
            })
          }

          // isCurrentStepValid
          // isValidAddress
          // getFields
          ctrl.isCurrentStepValid = () => {
            const step = ctrl.currentStep;
            const institution = ctrl.newInstitution;

            const testValids = (obj, ...fields) => {
              let valid = true;
              _.forEach(fields, f => {
                if (_.isUndefined(obj[f]) || _.isEmpty(obj[f])) {
                  valid = false;
                };
              })
              return valid;
            }

            const validAddress = () => {
              const address = institution.address;
              if (address && !_.isEmpty(address.country)) {
                if (address.country === 'Brasil') {
                  return testValids(address, 'street', 'federal_state', 'neighbourhood',
                  'city', 'cep');
                } else {
                  return true;
                }
              }
              return false;
            }

            const stepValidation = {
              0: validAddress(),
              1: testValids(institution, 'name', 'actuation_area', 'legal_nature',
                'institutional_email'),
              2: testValids(institution, 'description', 'leader'),
            }

            return stepValidation[step];
          };

          // nextStep
          ctrl.nextStep = () => {
            if (true) {
              ctrl.currentStep += 1;
            } else {
              MessageService.showToast("Campos obrigatórios não preenchidos corretamente.");
            }
          }

          // previousStep
          ctrl.previousStep = () => {
            if (ctrl.currentStep === 0) return;
            ctrl.currentStep -= 1;
          }

          Object.defineProperty(ctrl, 'currentStepLabel', {
            get: function() {
              const labels = {
                0: 'Dados Cadastrais',
                1: 'Dados da Instituiçao',
                2: 'Finalizar Cadastro',
              }
              return labels[ctrl.currentStep];
            }
          })

          ctrl.onNewPhoto = (photoSrc) => {
            ctrl.photoSrc = photoSrc;
          }

          // main()
          // initController()
          // setDefaultPhotoUrl
          ctrl.$onInit = () => {
            ctrl.institutionKey = $state.params.institutionKey;
            if (ctrl.institutionKey) {
              ctrl.loadInstitution(ctrl.institutionKey)
            // handle if its not a institution invite
            } else {
              $state.go(STATES.HOME);
            }
          }
        }]);
})();
