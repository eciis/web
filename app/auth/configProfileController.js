'use strict';

(function() {
    var app = angular.module("app");

    app.controller("ConfigProfileController", function ConfigProfileController($state, InstitutionService,
            AuthService, UserService, ImageService,$rootScope, $mdToast, $q) {
        var configProfileCtrl = this;

        // Variable used to observe the changes on the user model.
        var observer;

        configProfileCtrl.newUser = AuthService.getCurrentUser();
        configProfileCtrl.loading = false;

        configProfileCtrl.addImage = function(image) {
            var jpgType = "image/jpeg";
            var pngType = "image/png";
            var maximumSize = 5242880; // 5Mb in bytes
            var newSize = 800;

            if (image !== null && (image.type === jpgType || image.type === pngType) && image.size <= maximumSize) {
                ImageService.compress(image, newSize).then(function success(data) {
                    configProfileCtrl.photo_user = data;
                    ImageService.readFile(data, setImage);
                    configProfileCtrl.file = null;
                });
            } else {
                showToast("Imagem deve ser jpg ou png e menor que 5 Mb");
            }
        };

        function setImage(image) {
            $rootScope.$apply(function() {
                configProfileCtrl.newUser.photo_url = image.src;
            });
        }

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
                showToast("Campos obrigatórios não preenchidos corretamente.");
                deffered.reject();
            }
            return deffered.promise;
        }

        function showToast(msg) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(msg)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        }

        (function main() {
            observer = jsonpatch.observe(configProfileCtrl.newUser);
        })();
    });
})();