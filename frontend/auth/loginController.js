'use strict';

(function() {
    var app = angular.module("app");

    app.controller("LoginController", function LoginController(AuthService, $state, STATES, 
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
            loginCtrl.isLoading = true;
            AuthService.loginWithEmailAndPassword(loginCtrl.user.email, loginCtrl.user.password).then(
                function success() {
                    loginCtrl.isLoading = false;
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
            $state.go(STATES.RESET_PASSWORD);
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
                $state.go(STATES.HOME);
            }
        }

        (function main() {
            if (AuthService.isLoggedIn()) {
                $state.go(STATES.HOME);
            }
        })();
    });
})();