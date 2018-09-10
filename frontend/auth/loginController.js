'use strict';

(function() {
    var app = angular.module("app");

    app.controller("LoginController", function LoginController(AuthService, MessageService, $state, $mdDialog, 
            $stateParams, $location, $window) {
        var loginCtrl = this;

        loginCtrl.user = {};

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

        loginCtrl.requestPermission = function requestPermission() {
            console.log(firebase.messaging().requestPermission);
            firebase.messaging().requestPermission().then(function (obj) {
                firebase.messaging().getToken().then(function(token) {
                    console.log(token);
                })
            });
        };

        loginCtrl.loginWithEmailPassword = function loginWithEmailPassword() {
            AuthService.loginWithEmailAndPassword(loginCtrl.user.email, loginCtrl.user.password).then(
                function success() {
                    redirectTo(redirectPath);
                }
            );
        };

        loginCtrl.redirect = function success() {
            redirectTo(redirectPath);
        };

        loginCtrl.resetPassword = function resetPassword(ev) {
            $mdDialog.show({
                controller: "ResetPasswordController",
                controllerAs: "resetCtrl",
                templateUrl: '/app/auth/reset_password_dialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            });
        };

        loginCtrl.goToLandingPage = function goToLandingPage() {
            $window.open(Config.LANDINGPAGE_URL, '_self');
        };

        loginCtrl.requestInvite = function requestInvite() {
            loginCtrl.isRequestInvite = !loginCtrl.isRequestInvite;
        };

        function redirectTo(path) {
            if (path) {
                $location.path(path);
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