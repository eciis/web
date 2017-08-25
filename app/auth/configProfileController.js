'use strict';

(function() {
    var app = angular.module("app");

    app.controller("ConfigProfileController", function ConfigProfileController($state, InstitutionService, CropImageService,
            AuthService, UserService, ImageService, $rootScope, $mdToast, $q, MessageService) {
        var configProfileCtrl = this;

        // Variable used to observe the changes on the user model.
        var observer;

        configProfileCtrl.newUser = AuthService.getCurrentUser();
        configProfileCtrl.loading = false;

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
            $rootScope.$apply(function() {
                configProfileCtrl.newUser.photo_url = image.src;
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
                ImageService.saveImage(configProfileCtrl.photo_user).then(function(data) {
                    configProfileCtrl.newUser.photo_url = data.url;
                    configProfileCtrl.newUser.uploaded_images.push(data.url);
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
                var patch = jsonpatch.generate(observer);
                UserService.save(patch).then(function success() {
                    AuthService.reload().then(function success() {
                        $state.go("app.home");
                        deffered.resolve();
                    });
                });
            } else {
                MessageService.showToast("Campos obrigatórios não preenchidos corretamente.");
                deffered.reject();
            }
            return deffered.promise;
        }

        configProfileCtrl.showButton = function() {
            return !configProfileCtrl.loading;
        };

        (function main() {
            observer = jsonpatch.observe(configProfileCtrl.newUser);

            if (configProfileCtrl.newUser.name === 'Unknown') {
                delete configProfileCtrl.newUser.name;
            }
        })();
    });
})();