'use strict';

(function () {
    angular
    .module("app")
    .controller("ConfigProfileController", [
        '$state', 'STATES', '$stateParams', 'ProfileService', 'CropImageService', 'AuthService', '$q',
        'UserService', 'ImageService', '$rootScope', 'SCREEN_SIZES', 'MessageService', '$mdDialog', 'ObserverRecorderService',
        'PushNotificationService',
        ConfigProfileController
    ]);
    
    function ConfigProfileController($state, STATES, $stateParams, ProfileService, CropImageService, AuthService, 
        $q, UserService, ImageService, $rootScope, SCREEN_SIZES, MessageService, $mdDialog, ObserverRecorderService, PushNotificationService) {

        const configProfileCtrl = this;

        // Variable used to observe the changes on the user model.
        let observer;
        configProfileCtrl.cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
        configProfileCtrl.loadingSubmission = false;

        const DELETE_ACCOUNT_ALERT = "Ao excluir sua conta você não poderá mais acessar o sistema," +
            "exceto por meio de novo convite. Deseja realmente excluir sua conta?";

        configProfileCtrl.$onInit = () => {
            configProfileCtrl._setupUser();
            configProfileCtrl.setSaveButton();
            setPushNotificationModel();
        };

        configProfileCtrl._setupUser = () => {
            if(configProfileCtrl.canEdit()) {
                configProfileCtrl.user = AuthService.getCurrentUser();
                configProfileCtrl.newUser = _.cloneDeep(configProfileCtrl.user);
                observer = ObserverRecorderService.register(configProfileCtrl.user);
                configProfileCtrl._checkUserName();
            } else {
                UserService.getUser($stateParams.userKey)
                    .then(user => configProfileCtrl.user = user);
            }
        }
        
        configProfileCtrl._checkUserName = () => {
            if (configProfileCtrl.user.name === 'Unknown') {
                configProfileCtrl.user.name = "";
                configProfileCtrl.newUser.name = "";
            }
        }

        configProfileCtrl.getPhoto = () => {
            const user = configProfileCtrl.canEdit() ? configProfileCtrl.newUser : configProfileCtrl.user;
            return user && user.photo_url;
        }

        configProfileCtrl.addImage = function(image) {
            const newSize = 800;

            ImageService.compress(image, newSize).then(function success(data) {
                configProfileCtrl.photo_user = data;
                ImageService.readFile(data, setImage);
                configProfileCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
        };

        configProfileCtrl.canEdit = () => {
            return $stateParams.userKey === AuthService.getCurrentUser().key;
        };

        function setImage(image) {
            $rootScope.$apply(function () {
                configProfileCtrl.newUser.photo_url = image.src;
            });
        }

        configProfileCtrl.cropImage = function cropImage(imageFile, event) {
            CropImageService.crop(imageFile, event, 'circle').then(function success(croppedImage) {
                configProfileCtrl.addImage(croppedImage);
            }, function error() {
                configProfileCtrl.file = null;
            });
        };

        configProfileCtrl.finish = function finish() {
            configProfileCtrl.loadingSubmission = true;
            configProfileCtrl._saveImage().then(_ => {
                configProfileCtrl._saveUser()
                    .finally(_ => {
                        configProfileCtrl.loadingSubmission = false;
                    });
            })
        };

        configProfileCtrl._saveImage = () => {
            if(configProfileCtrl.photo_user) {
                return ImageService.saveImage(configProfileCtrl.photo_user)
                    .then(function (data) {
                        configProfileCtrl.user.photo_url = data.url;
                        configProfileCtrl.user.uploaded_images.push(data.url);
                    })
            }
            return $q.when();
        }

        configProfileCtrl._saveUser = () => {
            if (configProfileCtrl.newUser.isValid()) {
                updateUser();
                const patch = ObserverRecorderService.generate(observer);
                return UserService.save(patch)
                    .then(() => {
                        AuthService.save();
                        MessageService.showToast("Edição concluída com sucesso");
                    });
            } 
            MessageService.showToast("Campos obrigatórios não preenchidos corretamente.");
            return $q.when();
        }

        function updateUser() {
            const attributes = ["name", "cpf"];
            _.forEach(attributes, function(attr){
                _.set(configProfileCtrl.user, attr, _.get(configProfileCtrl.newUser, attr));
            });
        };

        configProfileCtrl.removeProfile = (event, institution) => {
            ProfileService.removeProfile(event, institution);
        };

        configProfileCtrl.editProfile = function editProfile(profile, event) {
            const templateUrl = Utils.selectFieldBasedOnScreenSize(
                'app/user/editProfile/edit_profile.html',
                'app/user/editProfile/edit_profile_mobile.html',
                SCREEN_SIZES.SMARTPHONE
            );
            $mdDialog.show({
                templateUrl: templateUrl,
                controller: 'EditProfileController',
                controllerAs: "editProfileCtrl",
                locals: { profile },
                targetEvent: event,
                clickOutsideToClose: false
            });
        };

        function isAdminOfAnyInstitution() {
            return !_.isEmpty(configProfileCtrl.user.institutions_admin);
        }

        configProfileCtrl.showProperty = property => Utils.showProperty(property);

        configProfileCtrl.deleteAccount = function deleteAccount(event) {
            if (!isAdminOfAnyInstitution()) {
                const confirm = $mdDialog.confirm();
                confirm
                    .clickOutsideToClose(false)
                    .title('Excluir conta')
                    .textContent(DELETE_ACCOUNT_ALERT)
                    .ariaLabel('Excluir conta')
                    .targetEvent(event)
                    .ok('Sim')
                    .cancel('Não');
                const promise = $mdDialog.show(confirm);
                promise.then(function () {
                    configProfileCtrl.user.state = 'inactive';
                    deleteUser();
                }, function () {
                    MessageService.showToast('Cancelado');
                });
                return promise;
            } else {
                MessageService.showToast('Não é possível excluir sua conta enquanto você for administrador de uma instituição.');
            }
        };

        configProfileCtrl.goToInstitution = function goToInstitution(institutionKey) {
            const url = $state.href(STATES.INST_TIMELINE, {institutionKey: institutionKey});
            window.open(url, '_blank');
        };

        configProfileCtrl.goBack = _ => {
            window.history.back();
        };

        /**
         * Sets save button's properties.
         */
        configProfileCtrl.setSaveButton = () => {
            configProfileCtrl.saveButton = {
                class: 'config-profile__toolbar--save',
                action: configProfileCtrl.finish,
                name: 'SALVAR',
                isAvailable: () => !configProfileCtrl.loadingSubmission
            };
        };

        function deleteUser() {
            const promise = UserService.deleteAccount();
            promise.then(function success() {
                AuthService.logout();
            });
            return promise;
        }

        /**
         * Subscribe or Unsubscribe user for push notification
         * according to configProfileCtrl.pushNotification model value.
         */
        configProfileCtrl.pushChange = () => {
            configProfileCtrl.pushNotification && configProfileCtrl._subscribeUser();
            !configProfileCtrl.pushNotification && configProfileCtrl._unsubscribeUser();
        };

        /**
         * Set configProfileCtrl.pushNotification according to the user's
         * push notification subscription.
         * True if push notification is active, false otherwise.
         */
        function setPushNotificationModel() {
            PushNotificationService.isPushNotificationActive().then((result) => {
                configProfileCtrl.pushNotification = result;
            });
        }

        /**
         * Stop device from receive push notification
         * @returns {Promise<T | never>}
         * @private
         */
        configProfileCtrl._unsubscribeUser = () => {
            return configProfileCtrl._openDialog().then(() => {
                return PushNotificationService.unsubscribeUserNotification();
            }).catch(() => {
                configProfileCtrl.pushNotification = true;
            });
        };

        /**
         * Allow device to receive push notification
         * @returns {Promise<T | never>}
         * @private
         */
        configProfileCtrl._subscribeUser = () => {
            return configProfileCtrl._openDialog().then(() => {
                return PushNotificationService.subscribeUserNotification();
            }).catch(() => {
                configProfileCtrl.pushNotification = false;
            });
        };

        /**
         * Dialog to double check user's choice about push notification permission.
         * @param event
         * @returns {*|Promise<PaymentResponse>|void}
         * @private
         */
        configProfileCtrl._openDialog = (event) => {
            const DIALOG_TEXT_SUBSCRIBE = "Deseja permitir notificação no dispositivo?";
            const DIALOG_TEXT_UNSUBSCRIBE = "Tem certeza que não deseja receber notificação no dispositivo?";
            const DIALOG_TEXT = configProfileCtrl.pushNotification? DIALOG_TEXT_SUBSCRIBE : DIALOG_TEXT_UNSUBSCRIBE;
            const confirm = $mdDialog.confirm();
            confirm
                .clickOutsideToClose(false)
                .title('Notificação no dispositivo')
                .textContent(DIALOG_TEXT)
                .ariaLabel('Notificação no dispositivo')
                .targetEvent(event)
                .ok('Sim')
                .cancel('Não');
            return $mdDialog.show(confirm);
        };
    }
})();