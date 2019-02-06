'use strict';

(function () {
    const app = angular.module("app");

    app.controller("ConfigProfileController", function ConfigProfileController($state, STATES, $stateParams,
        CropImageService, AuthService, UserService, ImageService, $rootScope, $q, MessageService, $mdDialog, ObserverRecorderService) {

        const configProfileCtrl = this;

        // Variable used to observe the changes on the user model.
        let observer;
        configProfileCtrl.cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
        configProfileCtrl.loadingSubmission = false;

        const HAS_ONLY_ONE_INSTITUTION_MSG = "Esta é a única instituição ao qual você é vinculado." +
            " Ao remover o vínculo você não poderá mais acessar o sistema," +
            " exceto por meio de novo convite. Deseja remover?";

        const HAS_MORE_THAN_ONE_INSTITUTION_MSG = "Ao remover o vínculo com esta instituição," +
            " você deixará de ser membro" +
            " e não poderá mais publicar na mesma," +
            " no entanto seus posts existentes serão mantidos. Deseja remover?";

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

        configProfileCtrl.removeInstitution = function removeInstitution(event, institution) {
            if (!isAdmin(institution.key)) {
                const confirm = $mdDialog.confirm();
                confirm
                    .clickOutsideToClose(false)
                    .title('Remover vínculo com ' + institution.name)
                    .textContent(hasMoreThanOneInstitution() ? HAS_MORE_THAN_ONE_INSTITUTION_MSG : HAS_ONLY_ONE_INSTITUTION_MSG)
                    .ariaLabel('Remover instituicao')
                    .targetEvent(event)
                    .ok('Sim')
                    .cancel('Não');
                const promise = $mdDialog.show(confirm);
                promise.then(function () {
                    deleteInstitution(institution.key);
                }, function () {
                    MessageService.showToast('Cancelado');
                });
                return promise;
            } else {
                MessageService.showToast('Desvínculo não permitido. Você é administrador dessa instituição.');
            }
        };

        configProfileCtrl.editProfile = function editProfile(profile, event) {
            $mdDialog.show({
                templateUrl: 'app/user/edit_profile.html',
                controller: 'EditProfileController',
                controllerAs: "editProfileCtrl",
                locals: { profile },
                targetEvent: event,
                clickOutsideToClose: false
            });
        };

        function isAdmin(institution_key) {
            return configProfileCtrl.newUser.isAdmin(institution_key);
        }

        function hasMoreThanOneInstitution() {
            return _.size(configProfileCtrl.user.institutions) > 1;
        }

        function deleteInstitution(institution_key) {
            return new Promise(resolve => {
                UserService.deleteInstitution(institution_key)
                    .then(_ => {
                        removeConection(institution_key);
                        resolve();
                    });
            });
        }

        function removeConection(institution_key) {
            if (_.size(configProfileCtrl.user.institutions) > 1) {
                configProfileCtrl.user.removeInstitution(institution_key);
                configProfileCtrl.user.removeProfile(institution_key);
                AuthService.save();
            } else {
                AuthService.logout();
            }
        }

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