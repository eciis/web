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
            }
        });

        configProfileCtrl.finish = function finish() {
            if (configProfileCtrl.newUser.isValid()) {
                UserService.save(configProfileCtrl.user, configProfileCtrl.newUser).then(function success() {
                    AuthService.reload().then(function success() {
                        $state.go("app.home");
                    });
                });
            } else {
                showToast("Campos obrigatórios não preenchidos corretamente.");
            }
        };

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
            configProfileCtrl.newUser = configProfileCtrl.user;
        })();
    });
})();