'use strict';

(function() {
    var app = angular.module("app");

    app.controller("ConfigProfileController", function ConfigProfileController($state, InstitutionService,
            AuthService, UserService, $rootScope, $mdToast, $q) {
        var configProfileCtrl = this;

        configProfileCtrl.newUser = {};

        Object.defineProperty(configProfileCtrl, 'user', {
            get: function() {
                return AuthService.user;
            },
            set: function set(newValue) {
                AuthService.user = newValue;
            }
        });

        configProfileCtrl.finish = function finish() {
            var deffered = $q.defer();
            if (configProfileCtrl.newUser.isValid()) {
                UserService.save(configProfileCtrl.user, configProfileCtrl.newUser).then(function success(data) {
                    configProfileCtrl.user = new User(data);
                    $state.go("app.home");
                    deffered.resolve();
                });
            } else {
                showToast("Campos obrigatórios não preenchidos corretamente.");
                deffered.reject();
            }
            return deffered.promise;
        };

        /**
        * TODO: Refact when change authentication flow.
        * @author: Andre L. Abrantes - 21-06-2017
        */
        if (configProfileCtrl.user) {
            setupUser();
        } else {
            // In case of refresh
            $rootScope.$on("user_loaded", function() {
                if (configProfileCtrl.user) {
                    setupUser();
                }
            });
        }

        function setupUser() {
            configProfileCtrl.newUser = new User(deepClone(configProfileCtrl.user));
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
    });
})();