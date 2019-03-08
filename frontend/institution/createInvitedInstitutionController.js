'use strict';
(function() {
  angular.module('app')
    .controller('CreateInvitedInstitutionController',
      ['STATES', '$state', 'AuthService', 'InstitutionService', 'MessageService', '$mdDialog', 'ObserverRecorderService', 'ImageService',
        function (STATES, $state, AuthService, InstitutionService, MessageService, $mdDialog, ObserverRecorderService, ImageService) {
          const ctrl = this;
          let observer;
          ctrl.loading = true;
          ctrl.currentStep = 0;
          ctrl.newInstitution = {};
          ctrl.user = {};

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
              observer = ObserverRecorderService.register(ctrl.newInstitution);

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
            if (ctrl.isCurrentStepValid()) {
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

          ctrl.submit = (event) => {
            const newInstitution = new Institution(ctrl.newInstitution);

            if (ctrl.isCurrentStepValid() && newInstitution.isValid()) {
              const inviteKey = $state.params.inviteKey;
              const instKey = ctrl.institutionKey;
              const senderName = $state.params.senderName;
              const dialogParent = angular.element('#create-inst-content');
              showConfirmationDialog(event, dialogParent)
                .then(() => {
                  ctrl.loading = true;
                  saveProfileImage(ctrl.photoSrc).then(() => {
                    saveAndUpdateInst(inviteKey, instKey, senderName)
                      .then(() => {
                        reloadAndRedirectHome();
                      })
                  })
                }).catch(e => {
                  ctrl.loading = false;
                  MessageService.showToast(e);
                })
            } else {
              MessageService.showToast("Campos obrigatórios não preenchidos corretamente.");
            }
          }

          function saveProfileImage(src) {
            if (!src) {
              return Promise.resolve()
            }

            return ImageService.saveImage(src).then(data => {
              ctrl.newInstitution.photo_url = data.url;
              return Promise.resolve();
            });
          }

          function reloadAndRedirectHome() {
            AuthService.reload().then(() => {
              $state.go(STATES.HOME).then(() => {
                ctrl.loading = false;
                const alert = $mdDialog.alert({
                  title: 'INSTITUIÇÃO CRIADA',
                  textContent: 'Estamos processando suas permissões hierárquicas. Em breve você receberá uma notificação e ficará habilitado para administrar a instituição e toda sua hierarquia na Plataforma Virtual CIS.',
                  ok: 'Fechar'
                });
                $mdDialog.show(alert);
              });
            });
          }

          function showConfirmationDialog(event, parent) {
            const confirm = $mdDialog.confirm(event)
              .parent(parent)
              .clickOutsideToClose(true)
              .title('FINALIZAR')
              .textContent('Você deseja finalizar e salvar os dados da instituição?')
              .ariaLabel('Finalizar')
              .targetEvent(event)
              .ok('Sim')
              .cancel('Não');
            return $mdDialog.show(confirm);
          }

          function saveAndUpdateInst(inviteKey, instKey, senderName) {
            const patch = ObserverRecorderService.generate(observer);
            const body = { sender_name: senderName }

            return InstitutionService.save(body, instKey, inviteKey).then((savedInst)=> {
              return InstitutionService.update(instKey, patch).then((updatedInst) => {
                updateUser(inviteKey, updatedInst);
              });
            });
          }

          function updateUser(key, inst) {
            ctrl.user.removeInvite(key);
            ctrl.user.institutions.push(inst);
            ctrl.user.institutions_admin.push(inst.key);
            ctrl.user.follow(inst);
            ctrl.user.addProfile(createProfile(inst));
            ctrl.user.changeInstitution(inst);
            AuthService.save();
          }

          function createProfile(inst) {
            return {
              email: null,
              institution_key: inst.key,
              institution: {
                name: inst.name,
                photo_url: inst.photo_url,
              },
              office: 'Administrador',
              phone: null,
              color: 'teal'
            };
          }

          // main()
          // initController()
          // setDefaultPhotoUrl
          ctrl.$onInit = () => {
            ctrl.user = AuthService.getCurrentUser();
            ctrl.institutionKey = $state.params.institutionKey;
            if (ctrl.institutionKey) {
              ctrl.loadInstitution(ctrl.institutionKey)
            } else {
              $state.go(STATES.HOME);
            }
          }
        }]);
})();
