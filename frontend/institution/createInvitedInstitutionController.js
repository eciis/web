'use strict';
(function() {
  angular.module('app')
    .controller('CreateInvitedInstitutionController',
      ['STATES', '$state', 'AuthService', 'InstitutionService', 'MessageService', '$mdDialog', 'ObserverRecorderService', 'ImageService', 'InviteService',
        function (STATES, $state, AuthService, InstitutionService, MessageService, $mdDialog, ObserverRecorderService, ImageService, InviteService) {
          const ctrl = this;
          let observer;
          ctrl.loading = true;
          ctrl.currentStep = 0;
          ctrl.newInstitution = {};
          ctrl.user = {};
          ctrl.invite = {};

          ctrl.stepColor = (step) => {
            return ctrl.currentStep === step ? 'light-green-500' : 'grey-500';
          };

          ctrl.backButton = () => {
            ctrl.currentStep === 0 ? window.history.back() : ctrl.previousStep();
          }

          /**
           * Loads the "empty" institution from InstitutionService and sets its default values.
           * This consists of a address with Brasil as a country, and the suggested name from inviter.
           * Sets an ObserverRecorderService required to generate a json patch later (when the institution is finally saved);
           *
           * @returns {Promise} - InstituionService promise;
           */
          ctrl.loadInstitution = () => {
            return InstitutionService.getInstitution(ctrl.institutionKey).then(res => {
              ctrl.newInstitution = res;
              ctrl.suggestedName = res.name;
              observer = ObserverRecorderService.register(ctrl.newInstitution);

              // Set default values
              ctrl.newInstitution.address = new Address(res.address);
              ctrl.newInstitution.address.country = ctrl.newInstitution.address.country || 'Brasil';
              ctrl.newInstitution.photo_url = ctrl.newInstitution.photo_url || 'app/images/institution.png';
              ctrl.loading = false;
            }, e => {
              ctrl.loading = false;
              MessageService.showToast(e);
            })
          }

          /**
           * Validates the current form step, based on required fields.
           * 1st step: requires a valid address. For institutions on Brazil,
           * this requires a valid street, federal_state, neighbourhood, city and cep.
           * For foreign institutions, this only requires a country.
           * 2nd step: requires a name, institutional_email, legal_nature and actuation_area.
           * 3rd step: requires a description and a leader.
           *
           * @returns {Boolean} - if the step is valid or not
           */
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

          ctrl.nextStep = () => {
            if (ctrl.isCurrentStepValid()) {
              ctrl.currentStep += 1;
            } else {
              MessageService.showToast("Campos obrigatórios não preenchidos corretamente.");
            }
          }

          ctrl.previousStep = () => {
            if (ctrl.currentStep === 0) return;
            ctrl.currentStep -= 1;
          }

          Object.defineProperty(ctrl, 'currentStepLabel', {
            get: function() {
              const labels = {
                0: 'Dados Cadastrais',
                1: 'Dados da Instituição',
                2: 'Finalizar Cadastro',
              }
              return labels[ctrl.currentStep];
            }
          })

          /**
           * Callback when the photo is changed on institutionInfo.component
           *
           * ctrl.photoSrc is needed to save the image later (when the Institution is finally saved).
           */
          ctrl.onNewPhoto = (photoSrc) => {
            ctrl.photoSrc = photoSrc;
          }

          /**
           * Submits current institution info and tries to save it.
           * Calls a chain of promises to deal with Institution saving, updating,
           *  and User updating.
           *
           * @params {Event} event - current click event
           */
          ctrl.submit = (event) => {
            const newInstitution = new Institution(ctrl.newInstitution);

            if (ctrl.isCurrentStepValid() && newInstitution.isValid()) {
              const inviteKey = $state.params.inviteKey;
              const instKey = ctrl.institutionKey;
              const senderName = $state.params.senderName;
              const dialogParent = angular.element('#create-inst-content');

              return showConfirmationDialog(event, dialogParent).then(() => {
                ctrl.loading = true;
                return saveProfileImage(ctrl.photoSrc);
              }).then(() => {
                return saveAndUpdateInst(inviteKey, instKey, senderName);
              }).then(() => {
                return reloadAndRedirectHome();
              }).catch(e => {
                ctrl.loading = false;
                MessageService.showToast(e);
              })
            } else {
              MessageService.showToast("Campos obrigatórios não preenchidos corretamente.");
            }
          }

          /**
           * Saves a image file as profile for the current institution.
           * If src is non existant (meaning user has not chosen a new profile picture),
           * this method bails out and resolves a Promise with nothing.
           * Otherwise, sets the Image through ImageService and resolves it.
           * @param {Image} src - current institutions image file (resized)
           *
           * @returns {Promise} - a Promise resolving with nothing
           */
          function saveProfileImage(src) {
            if (!src) {
              return Promise.resolve()
            }

            return ImageService.saveImage(src).then(data => {
              ctrl.newInstitution.photo_url = data.url;
            });
          }

          /**
           * Reloads the current user through AuthService, as needed to set this new Institution
           * as the User's current institution and update this info through the app and local storage.
           * Then, sends the user back to STATE.HOME with a confirmation message.
           */
          function reloadAndRedirectHome() {
            // Check if institution is currently a superior
            const message = _.isEqual(ctrl.invite.type_of_invite, 'INSTITUTION_PARENT') ?
              'Estamos processando suas permissões hierárquicas. Em breve você receberá uma notificação e ficará habilitado para administrar a instituição e toda sua hierarquia na Plataforma Virtual CIS.'
              :
              'A instituição foi criada e ja se encontra habilitada na Plataforma Virtual CIS.'

            return AuthService.reload().then(() => {
              return $state.go(STATES.HOME).then(() => {
                ctrl.loading = false;
                const alert = $mdDialog.alert({
                  title: 'INSTITUIÇÃO CRIADA',
                  textContent: message,
                  ok: 'Fechar'
                });
                return $mdDialog.show(alert);
              });
            });
          }

          /**
           * Shows a confirmation dialog asking the user about saving this new institution.
           * @param {Event} event - click event from DOM
           * @param {DOMElement} parent - parent element for the modal
           *
           * @returns {Promise} $mdDialog Promise
           */
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

          /**
           * Saves a (stub) institution, then promptly update it with info from the previous forms.
           * Calls #updateUser at the end.
           * @param {string} inviteKey - of current institution
           * @param {String} instKey - of current institution
           * @param {String} senderName - name of the current user
           *
           * @return {Promise} - InstitutionService#update promise.
           */
          function saveAndUpdateInst(inviteKey, instKey, senderName) {
            const patch = ObserverRecorderService.generate(observer);
            const body = { sender_name: senderName }

            return InstitutionService.save(body, instKey, inviteKey).then(()=> {
              return InstitutionService.update(instKey, patch).then((updatedInst) => {
                updateUser(inviteKey, updatedInst);
              });
            });
          }

          /**
           * Updates the current User, setting up the created institution (and it as user's current),
           * removing its invite key and saving it through AuthService.
           * @param {String} key - invite key
           * @param {Institution} inst - created institution
           *
           * Replaces:
           * #updateUser
           */
          function updateUser(key, inst) {
            ctrl.user.removeInvite(key);
            ctrl.user.institutions.push(inst);
            ctrl.user.institutions_admin.push(inst.key);
            ctrl.user.follow(inst);
            ctrl.user.addProfile(createProfile(inst));
            ctrl.user.changeInstitution(inst);
            AuthService.save();
          }

          /**
           * Creates a new "empty" profile for the institution.
           * @param {Institution} inst - Institution to generate profile
           *
           * Replaces:
           * #createProfile
           *
           * @returns {Object} - An empty institution profile
           */
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

          /**
           * Initializes the controller, setting current user and institution key.
           * Redirects if there's no institution key.
           *
           * Replaces:
           * #main
           * #initController
           * #setDefaultPhotoUrl
           */
          ctrl.$onInit = () => {
            ctrl.user = AuthService.getCurrentUser();
            ctrl.institutionKey = $state.params.institutionKey;
            const inviteKey = $state.params.inviteKey;
            InviteService.getInvite(inviteKey).then(res => {
              ctrl.invite = res;
            })
            if (ctrl.institutionKey) {
              ctrl.loadInstitution(ctrl.institutionKey)
            } else {
              $state.go(STATES.HOME);
            }
          }
        }]);
})();
