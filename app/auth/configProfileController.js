'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("ConfigProfileController", function ConfigProfileController($state, InstitutionService, 
            AuthService, UserService, $rootScope, $mdToast, $q) {
        var configProfileCtrl = this;

        configProfileCtrl.newUser = {};

        configProfileCtrl.user = AuthService.getCurrentUser();

        configProfileCtrl.finish = function finish() {
            var deffered = $q.defer();
            if (configProfileCtrl.newUser.isValid()) {
                UserService.save(configProfileCtrl.user, configProfileCtrl.newUser).then(function success() {
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