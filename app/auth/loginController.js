'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("LoginController", function LoginController(AuthService, $state) {
        var loginCtrl = this;

        loginCtrl.login = function login() {
            AuthService.login().then(function success() {
                $state.go("app.home");
            });
        };

        loginCtrl.limpar = function limpar() {
            loginCtrl.user = {};
        };

        (function main() {
            if (AuthService.isLoggedIn()) {
                $state.go("app.home");
            }
        })();
    });
})();