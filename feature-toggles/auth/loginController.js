(function() {
    'use strict';
    const app = angular.module('app');

    app.controller('LoginController', function(AuthService, $state, 
        $stateParams, $window) {
        const loginCtrl = this;

        loginCtrl.user = {};

        loginCtrl.isRequestInvite = false;

        var redirectPath = $stateParams.redirect;

        loginCtrl.showToast = function showToast(message) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        };

        loginCtrl.loginWithGoogle = function loginWithGoogle() {
            var promise = AuthService.loginWithGoogle();
            promise.then(function success() {
                redirectTo(redirectPath);
            }).catch(function(error) {
                loginCtrl.showToast(error);
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
                loginCtrl.showToast(error);
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
                $state.go("manage-features");
            }
        }

        (function main() {
            if (AuthService.isLoggedIn()) {
                $state.go("manage-features");
            }
        })();
    });
})();