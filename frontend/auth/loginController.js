'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("LoginController", function LoginController(AuthService, MessageService, $state, $mdDialog) {
        var loginCtrl = this;

        loginCtrl.user = {};

        loginCtrl.newUser = {};

        loginCtrl.login = function login() {
            var promise = AuthService.login();
            promise.then(function success() {
                $state.go("app.home");
            });
            return promise;
        };

        loginCtrl.limpar = function limpar() {
            loginCtrl.user = {};
        };

        loginCtrl.loginWithEmailPassword = function loginWithEmailPassword() {
            AuthService.loginWithEmailAndPassword(loginCtrl.user.email, loginCtrl.user.password).then(
                function success() {
                    $state.go("app.home");
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
                    $state.go("app.home");
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

        (function main() {
            if (AuthService.isLoggedIn()) {
                $state.go("app.home");
            }
        })();
    });
})();