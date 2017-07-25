'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("LoginController", function LoginController(AuthService, MessageService, $state) {
        var loginCtrl = this;

        loginCtrl.user = {};

        loginCtrl.newUser = {};

        loginCtrl.login = function login() {
            AuthService.login().then(function success() {
                $state.go("app.home");
            });
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
            AuthService.signupWithEmailAndPassword(newUser.email, newUser.password).then(function success() {
                $state.go("app.home");
            });
        };

        (function main() {
            if (AuthService.isLoggedIn()) {
                $state.go("app.home");
            }
        })();
    });
})();