'use strict';

(function() {
   var app = angular.module('app');

   app.controller('NewInviteController', function NewInviteController(AuthService, InviteService,
    $mdDialog, MessageService, ObserverRecorderService, $state, STATES) {
        var newInviteCtrl = this;

        newInviteCtrl.institution = null;
        newInviteCtrl.inviteKey = $state.params.key;
        newInviteCtrl.acceptedInvite = false;
        newInviteCtrl.user = AuthService.getCurrentUser();
        newInviteCtrl.phoneRegex = "[0-9]{2}[\\s][0-9]{4,5}[-][0-9]{4,5}";
        newInviteCtrl.loading = true;
        newInviteCtrl.isAlreadyProcessed = false;

        var observer;

        var institutionKey;

        newInviteCtrl.acceptInvite = function acceptInvite(event) {
            newInviteCtrl.acceptedInvite = true;
            if (newInviteCtrl.invite.type_of_invite === "USER") {
                if(isValidProfile()) {
                    if (!userIsAMember()) {
                        newInviteCtrl.addInstitution(event);
                    } else {
                        MessageService.showToast('Você já é membro dessa instituição');
                        newInviteCtrl.deleteInvite();
                    }
                }
            } else {
                newInviteCtrl.goToInstForm();
            }
        };

        newInviteCtrl.saveInstProfile = function configInstProfile() {
            var profile = {phone: newInviteCtrl.phone,
                    branch_line: newInviteCtrl.branch_line,
                    email: newInviteCtrl.email,
                    office: newInviteCtrl.office,
                    institution_key: newInviteCtrl.institution.key,
                    institution_name: newInviteCtrl.institution.name,
                    institution_photo_url: newInviteCtrl.institution.photo_url};
            newInviteCtrl.user.addProfile(profile);
            newInviteCtrl.user.name = getCurrentName();
            AuthService.save();
            var patch = ObserverRecorderService.generate(observer);
            return patch;
        };

        newInviteCtrl.addInstitution =  function addInstitution(event) {
            var patch = newInviteCtrl.saveInstProfile();

            var promise = InviteService.acceptUserInvite(patch, newInviteCtrl.inviteKey);
                promise.then(function success(userSaved) {
                    newInviteCtrl.user.removeInvite(newInviteCtrl.inviteKey);
                    newInviteCtrl.user.institutions = userSaved.institutions;
                    newInviteCtrl.user.institution_profiles = userSaved.institution_profiles;
                    newInviteCtrl.user.follows = userSaved.follows;
                    newInviteCtrl.user.state = 'active';
                    newInviteCtrl.user.changeInstitution(newInviteCtrl.institution);
                    AuthService.save();
                    $state.go(STATES.HOME);
                    _.isEmpty(newInviteCtrl.user.invites) && showAlert(event);
                }, function error() {
                    redirectFromError();
                });
            return promise;
        };

        newInviteCtrl.goToInstForm =function goToInstForm() {
            $state.go(STATES.CREATE_INST_FORM, {
                senderName: getCurrentName(),
                institutionKey: institutionKey,
                inviteKey: newInviteCtrl.inviteKey
            });
        };

        newInviteCtrl.goToHome = function goToHome() {
            $state.go(STATES.HOME);
        };

        newInviteCtrl.isInviteUser = function isInviteUser(){
            return newInviteCtrl.invite && newInviteCtrl.invite.type_of_invite === "USER";
        };

        newInviteCtrl.isUserInfoImcomplete = function isUserInfoImcomplete() {
            var isNewUser = newInviteCtrl.user.name === "";
            return newInviteCtrl.isInviteUser() || isNewUser;
        };

        newInviteCtrl.rejectInvite = function rejectInvite(event){
            var confirm = $mdDialog.confirm();
                confirm
                    .clickOutsideToClose(false)
                    .title('Rejeitar convite')
                    .textContent("Ao rejeitar o convite, seu convite será removido e não poderá ser aceito posteriormente." +
                         " Deseja rejeitar?")
                    .ariaLabel('Rejeitar convite')
                    .targetEvent(event)
                    .ok('Sim')
                    .cancel('Não');
                    var promise = $mdDialog.show(confirm);
                promise.then(function() {
                   newInviteCtrl.deleteInvite();
                }, function() {
                    MessageService.showToast('Cancelado');
                });
                return promise;
        };

        newInviteCtrl.checkUserName = function checkUserName() {
            if(newInviteCtrl.user.name === 'Unknown') {
                newInviteCtrl.user.name = '';
            }
            return _.isEmpty(newInviteCtrl.user.name);
        };

        newInviteCtrl.getFullAddress = function getFullAddress() {
            var instObj = new Institution(newInviteCtrl.institution);
            return instObj.getFullAddress();
        };

        newInviteCtrl.answerLater = function answerLater() {
            newInviteCtrl.user.invites.forEach(invite => {
                if(invite.key === newInviteCtrl.inviteKey){
                    invite.answerLater = true;
                    AuthService.save();
                }
            });
            $state.go(STATES.HOME);
        };

        newInviteCtrl.canAnswerLater = function canAnswerLater() {
            var userActive = newInviteCtrl.user.state === 'active';
            return !newInviteCtrl.loading && !newInviteCtrl.isAlreadyProcessed && userActive;
        };


        newInviteCtrl.deleteInvite = function deleteInvite() {
            const inviteFunction = getInviteFunction();
            var promise = inviteFunction(newInviteCtrl.inviteKey);
            promise.then(function success() {
                newInviteCtrl.user.removeInvite(newInviteCtrl.inviteKey);
                AuthService.save();
                if(newInviteCtrl.user.isInactive()) {
                    $state.go(STATES.USER_INACTIVE);
                } else {
                    $state.go(STATES.HOME);
                }
            });
            return promise;
        }

        newInviteCtrl.showMobileInstInviteScreen = () => {
          return Utils.isMobileScreen() && !newInviteCtrl.isInviteUser();
        };

        function showAlert(event) {
            $mdDialog.show({
                templateUrl: 'app/invites/welcome_dialog.html',
                controller: function WelcomeController() {
                    var controller = this;
                    controller.next = false;
                    controller.cancel = function() {
                        $mdDialog.cancel();
                    };
                },
                controllerAs: "controller",
                targetEvent: event,
                clickOutsideToClose: false
            });
        }

        function loadInvite(){
            observer = ObserverRecorderService.register(newInviteCtrl.user);
            newInviteCtrl.checkUserName();
            InviteService.getInvite(newInviteCtrl.inviteKey).then(
                function success(response) {
                    newInviteCtrl.invite = new Invite(response);
                    if(newInviteCtrl.invite.status === 'sent') {
                        institutionKey = (newInviteCtrl.invite.type_of_invite === "USER") ? newInviteCtrl.invite.institution_key : newInviteCtrl.invite.stub_institution.key;
                        newInviteCtrl.institution = newInviteCtrl.invite.institution;
                    } else {
                        newInviteCtrl.isAlreadyProcessed = true;
                    }
                    newInviteCtrl.loading = false;
                }, function error() {
                    newInviteCtrl.loading = true;
            });
        }

        function getInviteFunction() {
            const inviteUser = newInviteCtrl.invite.type_of_invite === "USER";
            return inviteUser ? InviteService.deleteUserInvite : InviteService.deleteInstitutionInvite; 
        }

        function isValidProfile() {
            if(!newInviteCtrl.office) {
                MessageService.showToast("Cargo institucional deve ser preenchido.");
                return false;
            }
            return true;
        }

        function getCurrentName() {
            return newInviteCtrl.user_name ? newInviteCtrl.user_name : newInviteCtrl.user.name;
        }

        function userIsAMember() {
            var userIsMember = false;
            _.each(newInviteCtrl.user.institutions, function (institution) {
                userIsMember = institution.key === newInviteCtrl.institution.key;
            });
            return userIsMember;
        }

       function redirectFromError() {
           newInviteCtrl.user.isInactive() ? $state.go(STATES.USER_INACTIVE) : $state.go(STATES.HOME);
       }

        loadInvite();
   });
})();