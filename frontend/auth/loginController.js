'use strict';

(function() {
    var app = angular.module("app");

    app.controller("LoginController", function LoginController(AuthService, MessageService, $state, $mdDialog, 
            $stateParams, $location) {
        var loginCtrl = this;

        loginCtrl.user = {};

        loginCtrl.newUser = {};
        loginCtrl.isRequestInvite = false;

        var redirectPath = $stateParams.redirect;

        loginCtrl.login = function login() {
            var promise = AuthService.login();
            promise.then(function success() {
                redirectTo(redirectPath);
            });
            return promise;
        };

        loginCtrl.limpar = function limpar() {
            loginCtrl.user = {};
        };

        loginCtrl.loginWithEmailPassword = function loginWithEmailPassword() {
            AuthService.loginWithEmailAndPassword(loginCtrl.user.email, loginCtrl.user.password).then(
                function success() {
                    redirectTo(redirectPath);
                }
            );
        };

        loginCtrl.signup = function signup() {
            var newUser = loginCtrl.newUser;
            if (newUser.password !== newUser.verifypassword) {
                MessageService.showToast("Senhas incompatíveis");
                return;
            }
            AuthService.signupWithEmailAndPassword(newUser.email, newUser.password).then(
                function success() {
                    redirectTo(redirectPath);
                }
            );
        };

        loginCtrl.resetPassword = function resetPassword(ev) {
            var confirm = $mdDialog.prompt()
                .title('Esqueceu sua senha?')
                .textContent('Digite seu email e vamos lhe enviar um link para criar uma nova senha.')
                .placeholder('Digite seu email')
                .ariaLabel('Digite seu emai')
                .targetEvent(ev)
                .required(true)
                .ok("Resetar Senha")
                .cancel("Cancelar");

            $mdDialog.show(confirm).then(function(email) {
                AuthService.resetPassword(email);
            });
        };

        function redirectTo(path) {
            /* FIXME: Verify the state before redirect is not a good
            *  approach to do that.
            *  @author: Andre L. Abrantes - 10-11-2017
            */
            console.log(path)
            if (path) {
                $location.path(path);
            } else {
                $state.go("app.home");
            }
        }

        (function main() {
            if (AuthService.isLoggedIn()) {
                $state.go("app.home");
            }
        })();
    });
})();