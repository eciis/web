'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("ConfigProfileController", function ConfigProfileController($state, InstitutionService, 
            AuthService, UserService, $rootScope, $mdToast) {
        var configPrileCtrl = this;

        configPrileCtrl.newUser = {};

        Object.defineProperty(configPrileCtrl, 'user', {
            get: function() {
                return AuthService.user;
            },
            set: function set(newValue) {
                AuthService.user = newValue;
            }
        });

        configPrileCtrl.finish = function finish() {
            if (configPrileCtrl.newUser.isValid()) {
                UserService.save(configPrileCtrl.user, configPrileCtrl.newUser).then(function success(data) {
                    configPrileCtrl.user = new User(data);
                    $state.go("app.home");
                });
            } else {
                showToast("Campos obrigatórios não preenchidos corretamente.");
            }
        };

        /**
        * TODO: Refact when change authentication flow.
        * @author: Andre L. Abrantes - 21-06-2017
        */
        if (configPrileCtrl.user) {
            setupUser();
        } else {
            // In case of refresh
            $rootScope.$on("user_loaded", function() {
                if (configPrileCtrl.user) {
                    setupUser();
                }
            });
        }

        function setupUser() {
            configPrileCtrl.newUser = new User(configPrileCtrl.user);
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