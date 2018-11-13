'use strict';

(function() {
    var app = angular.module("app");

    app.controller("LoginController", function LoginController(AuthService, $state, $mdDialog, 
            $stateParams, $window, MessageService) {
        var loginCtrl = this;

        loginCtrl.user = {};

        loginCtrl.isRequestInvite = false;

        var redirectPath = $stateParams.redirect;

        loginCtrl.loginWithGoogle = function loginWithGoogle() {
            var promise = AuthService.loginWithGoogle();
            promise.then(function success() {
                redirectTo(redirectPath);
            }).catch(function(error) {
                MessageService.showToast(error);
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
            ).catch(function(error) {
                MessageService.showToast(error);
            });
        };

        loginCtrl.redirect = function success() {
            redirectTo(redirectPath);
        };

        loginCtrl.resetPassword = function resetPassword(ev) {
            $state.go("reset_password");
        };

        loginCtrl.goToLandingPage = function goToLandingPage() {
            $window.open(Config.LANDINGPAGE_URL, '_self');
        };

        loginCtrl.requestInvite = function requestInvite() {
            loginCtrl.isRequestInvite = !loginCtrl.isRequestInvite;
        };

        function redirectTo(path) {
            if (path) {
                window.location.pathname = path;
            } else {
                $state.go("app.user.home");
            }
        }

        (function main() {
            if (AuthService.isLoggedIn()) {
                $state.go("app.user.home");
            }
        })();
    });
})();