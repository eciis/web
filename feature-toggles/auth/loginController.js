(function() {
    'use strict';
    const app = angular.module('app');

    app.controller('LoginController', function(AuthService, $state, 
        $stateParams, $window, MessageService, STATES) {
        const loginCtrl = this;

        loginCtrl.user = {};

        loginCtrl.isRequestInvite = false;

        var redirectPath = $stateParams.redirect;

        loginCtrl.loginWithGoogle = function loginWithGoogle() {
            return AuthService.loginWithGoogle().then(function success() {
                loginCtrl._redirectTo(redirectPath);
            }).catch(function(error) {
                MessageService.showToast(error);
            });
        };

        /**
         * Verify if the Auth Service is loading User.
         * @returns {boolean} True if it is loading user, false if not.
         */
        loginCtrl.isLoadingUser = function () {
            return AuthService.isLoadingUser;
        };


        loginCtrl.loginWithEmailPassword = function loginWithEmailPassword() {
            return AuthService.loginWithEmailAndPassword(loginCtrl.user.email, loginCtrl.user.password).then(
                function success() {
                    loginCtrl._redirectTo(redirectPath);
                }
            ).catch(function(error) {
                MessageService.showToast(error);
            });
        };

        loginCtrl.redirect = function success() {
            loginCtrl._redirectTo(redirectPath);
        };

        loginCtrl.goToLandingPage = function goToLandingPage() {
            $window.open(Config.LANDINGPAGE_URL, '_self');
        };

        loginCtrl.requestInvite = function requestInvite() {
            loginCtrl.isRequestInvite = !loginCtrl.isRequestInvite;
        };

        loginCtrl._redirectTo =  function redirectTo(path) {
            if (path) {
                window.location.pathname = path;
            } else {
                $state.go(STATES.MANAGE_FEATURES);
            }
        }

        loginCtrl.$onInit = function main() {
            if (AuthService.isLoggedIn()) {
                $state.go(STATES.MANAGE_FEATURES);
            }
        };
    });
})();