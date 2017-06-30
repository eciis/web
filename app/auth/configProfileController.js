'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("ConfigProfileController", function ConfigProfileController($state, InstitutionService, 
            AuthService, UserService, $rootScope, $mdToast) {
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
            var promise = null;
            if (configProfileCtrl.newUser.isValid()) {
                promise = UserService.save(configProfileCtrl.user, configProfileCtrl.newUser);
                promise.then(function success(data) {
                    configProfileCtrl.user = new User(data);
                    $state.go("app.home");
                });
            } else {
                showToast("Campos obrigatórios não preenchidos corretamente.");
            }
            return promise;
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
            configProfileCtrl.newUser = new User(configProfileCtrl.user);
        }

        function showToast(msg) {
            var simple = $mdToast.simple()
            simple.textContent(msg)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right');
            $mdToast.show(
                simple
            );
        }
    });
})();