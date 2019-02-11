'use strict';

(function () {
    const app = angular.module("app");

    app.controller("ConfigProfileController", function ConfigProfileController($state, STATES, $stateParams, ProfileService,
        CropImageService, AuthService, UserService, ImageService, $rootScope, SCREEN_SIZES, MessageService, $mdDialog, ObserverRecorderService) {

        const configProfileCtrl = this;

        // Variable used to observe the changes on the user model.
        let observer;
        configProfileCtrl.cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
        configProfileCtrl.loadingSubmission = false;

        const DELETE_ACCOUNT_ALERT = "Ao excluir sua conta você não poderá mais acessar o sistema," +
            "exceto por meio de novo convite. Deseja realmente excluir sua conta?";

        configProfileCtrl.$onInit = () => {
            setupUser();
        }

        const setupUser = () => {
            if(configProfileCtrl.canEdit()) {
                configProfileCtrl.user = AuthService.getCurrentUser();
                configProfileCtrl.newUser = _.cloneDeep(configProfileCtrl.user);
                observer = ObserverRecorderService.register(configProfileCtrl.user);
                checkUserName();
            } else {
                UserService.getUser($stateParams.userKey)
                    .then(user => configProfileCtrl.user = user);
            }
        }
        
        const checkUserName = () => {
            if (configProfileCtrl.user.name === 'Unknown') {
                delete configProfileCtrl.user.name;
                delete configProfileCtrl.newUser.name;
            }
        }

        configProfileCtrl.getPhoto = () => {
            const user = configProfileCtrl.canEdit() ? configProfileCtrl.newUser : configProfileCtrl.user;
            return user.photo_url;
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
            saveImage().then(_ => {
                saveUser()
                    .finally(_ => {
                        configProfileCtrl.loadingSubmission = false;
                    });
            })
        };

        const saveImage = () => {
            return new Promise((resolve) => {
                if(configProfileCtrl.photo_user) {
                    ImageService.saveImage(configProfileCtrl.photo_user)
                        .then(function (data) {
                            configProfileCtrl.user.photo_url = data.url;
                            configProfileCtrl.user.uploaded_images.push(data.url);
                            resolve();
                        })
                } else {
                    resolve();
                }
            })
        }

        const saveUser = () => {
            return new Promise((resolve) => {
                if (configProfileCtrl.newUser.isValid()) {
                    updateUser();
                    const patch = ObserverRecorderService.generate(observer);
                    UserService.save(patch)
                        .then(() => {
                            AuthService.save();
                            MessageService.showToast("Edição concluída com sucesso");
                            resolve();
                        });
                } else {
                    MessageService.showToast("Campos obrigatórios não preenchidos corretamente.");
                    resolve();
                }
            });
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

        function deleteUser() {
            const promise = UserService.deleteAccount();
            promise.then(function success() {
                AuthService.logout();
            });
            return promise;
        }
    });
})();