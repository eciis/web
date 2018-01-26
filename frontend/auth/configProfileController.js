'use strict';

(function () {
    var app = angular.module("app");

    app.controller("ConfigProfileController", function ConfigProfileController($state, InstitutionService,
        CropImageService, AuthService, UserService, ImageService, $rootScope, $mdToast, $q, MessageService, $mdDialog) {

        var configProfileCtrl = this;

        // Variable used to observe the changes on the user model.
        var observer;

        configProfileCtrl.user = AuthService.getCurrentUser();
        configProfileCtrl.newUser = _.clone(configProfileCtrl.user);
        configProfileCtrl.loading = false;
        configProfileCtrl.cpfRegex = /^\d{3}\.\d{3}\.\d{3}\-\d{2}$/;
        configProfileCtrl.photo_url = configProfileCtrl.newUser.photo_url;

        var HAS_ONLY_ONE_INSTITUTION_MSG = "Esta é a única instituição ao qual você é vinculado." +
            " Ao remover o vínculo você não poderá mais acessar o sistema," +
            " exceto por meio de novo convite. Deseja remover?";

        var HAS_MORE_THAN_ONE_INSTITUTION_MSG = "Ao remover o vínculo com esta instituição," +
            " você deixará de ser membro" +
            " e não poderá mais publicar na mesma," +
            " no entanto seus posts existentes serão mantidos. Deseja remover?";

        var DELETE_ACCOUNT_ALERT = "Ao excluir sua conta você não poderá mais acessar o sistema," +
            "exceto por meio de novo convite. Deseja realmente excluir sua conta?";

        configProfileCtrl.addImage = function(image) {
            var newSize = 800;

            ImageService.compress(image, newSize).then(function success(data) {
                configProfileCtrl.photo_user = data;
                ImageService.readFile(data, setImage);
                configProfileCtrl.file = null;
            }, function error(error) {
                MessageService.showToast(error);
            });
        };

        function setImage(image) {
            $rootScope.$apply(function () {
                configProfileCtrl.photo_url = image.src;
            });
        }

        configProfileCtrl.cropImage = function cropImage(imageFile) {
            CropImageService.crop(imageFile).then(function success(croppedImage) {
                configProfileCtrl.addImage(croppedImage);
            }, function error() {
                configProfileCtrl.file = null;
            });
        };

        configProfileCtrl.finish = function finish() {
            if (configProfileCtrl.photo_user) {
                configProfileCtrl.loading = true;
                ImageService.saveImage(configProfileCtrl.photo_user).then(function (data) {
                    configProfileCtrl.user.photo_url = data.url;
                    configProfileCtrl.user.uploaded_images.push(data.url);
                    saveUser();
                    configProfileCtrl.loading = false;
                });
            } else {
                return saveUser();
            }
        };

        function saveUser() {
            var deffered = $q.defer();
            if (configProfileCtrl.newUser.isValid()) {
                updateUser();
                var patch = jsonpatch.generate(observer);
                UserService.save(patch).then(function success() {
                    AuthService.save();
                    $state.go("app.user.home");
                    deffered.resolve();
                });
            } else {
                MessageService.showToast("Campos obrigatórios não preenchidos corretamente.");
                deffered.reject();
            }
            return deffered.promise;
        }

        function updateUser() {
            var attributes = ["name", "cpf"];
            _.forEach(attributes, function(attr){
                _.set(configProfileCtrl.user, attr, _.get(configProfileCtrl.newUser, attr));
            });
        };

        configProfileCtrl.showButton = function () {
            return !configProfileCtrl.loading;
        };

        configProfileCtrl.removeInstitution = function removeInstitution(event, institution) {
            if (!isAdmin(institution.key)) {
                var confirm = $mdDialog.confirm();
                confirm
                    .clickOutsideToClose(false)
                    .title('Remover vínculo com ' + institution.name)
                    .textContent(hasMoreThanOneInstitution() ? HAS_MORE_THAN_ONE_INSTITUTION_MSG : HAS_ONLY_ONE_INSTITUTION_MSG)
                    .ariaLabel('Remover instituicao')
                    .targetEvent(event)
                    .ok('Sim')
                    .cancel('Não');
                var promise = $mdDialog.show(confirm);
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

        configProfileCtrl.editProfile = function editProfile(inst, ev) {
            $mdDialog.show({
                templateUrl: 'app/user/edit_profile.html',
                controller: 'EditProfileController',
                controllerAs: "editProfileCtrl",
                locals: {
                    institution: inst
                },
                targetEvent: ev,
                clickOutsideToClose: true
            });
        };

        function isAdmin(institution_key) {
            return configProfileCtrl.newUser.isAdmin(institution_key);
        }

        function hasMoreThanOneInstitution() {
            return _.size(configProfileCtrl.user.institutions) > 1;
        }

        function deleteInstitution(institution_key) {
            var promise = UserService.deleteInstitution(institution_key);
            promise.then(function success() {
                removeConection(institution_key);
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }

        function removeConection(institution_key) {
            if (_.size(configProfileCtrl.user.institutions) > 1) {
                _.remove(configProfileCtrl.user.institutions, function(institution) {
                    return institution.key === institution_key;
                });
                _.remove(configProfileCtrl.user.institution_profiles, function(profile) {
                    return profile.institution_key === institution_key;
                });
                AuthService.save();
            } else {
                AuthService.logout();
            }
        }

        function isAdminOfAnyInstitution() {
            return !_.isEmpty(configProfileCtrl.user.institutions_admin);
        }

        configProfileCtrl.deleteAccount = function deleteAccount(event) {
            if (!isAdminOfAnyInstitution()) {
                var confirm = $mdDialog.confirm();
                confirm
                    .clickOutsideToClose(false)
                    .title('Excluir conta')
                    .textContent(DELETE_ACCOUNT_ALERT)
                    .ariaLabel('Excluir conta')
                    .targetEvent(event)
                    .ok('Sim')
                    .cancel('Não');
                var promise = $mdDialog.show(confirm);
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

        function deleteUser() {
            var patch = jsonpatch.generate(observer);
            var promise = UserService.save(patch);
            promise.then(function success() {
                AuthService.logout();
            }, function error(response) {
                MessageService.showToast(response.data.msg);
            });
            return promise;
        }

        (function main() {
            observer = jsonpatch.observe(configProfileCtrl.user);

            if (configProfileCtrl.user.name === 'Unknown') {
                delete configProfileCtrl.user.name;
                delete configProfileCtrl.newUser.name;
            }
        })();
    });


    app.controller("EditProfileController", function EditProfileController(institution, ProfileService,
        AuthService, $mdDialog, MessageService) {
        var editProfileCtrl = this;
        editProfileCtrl.phoneRegex = "[0-9]{2}[\\s][0-9]{4,5}[-][0-9]{4,5}";
        editProfileCtrl.user = AuthService.getCurrentUser();
        editProfileCtrl.institution = institution;
        let profileObserver = {};
        let oldProfile;

        editProfileCtrl.edit = function edit() {
            if (isValidProfile()) {
                var patch = jsonpatch.generate(profileObserver);
                if (!_.isEmpty(patch)) {
                    ProfileService.editProfile(patch).then(function success() {
                        MessageService.showToast('Perfil editado com sucesso');
                        AuthService.save();
                    }, function error(response) {
                        MessageService.showToast(response.data.msg);
                    });
                }
                $mdDialog.hide();
            } else {
                MessageService.showToast('O cargo é obrigatório.');
            } 
        };

        editProfileCtrl.closeDialog = function closeDialog() {
            const indexOfProfile = editProfileCtrl.user.institution_profiles.indexOf(editProfileCtrl.profile);
            editProfileCtrl.user.institution_profiles[indexOfProfile] = oldProfile;
            $mdDialog.hide();
        };

        function isValidProfile() {
            return !_.isEmpty(editProfileCtrl.profile.office);
        }

        (function main() {
            editProfileCtrl.profile = editProfileCtrl.user.institution_profiles
                .filter(profile => profile.institution_key === editProfileCtrl.institution.key)
                .reduce(profile => profile);
            oldProfile = _.clone(editProfileCtrl.profile);
            profileObserver = jsonpatch.observe(editProfileCtrl.user);
        })();
    });
})();