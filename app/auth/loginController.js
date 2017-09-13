'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("LoginController", function LoginController(AuthService, MessageService, $state) {
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

        function isInactive(user) {
            var notMember = user.institutions.length === 0;
            var notInvitee = user.invites.length === 0;
            var notActive = user.state != 'active';
            return ((notMember && notInvitee) || notActive);
        }

        loginCtrl.signup = function signup() {
            var newUser = loginCtrl.newUser;
            if (newUser.password !== newUser.verifypassword) {
                MessageService.showToast("Senhas incompatíveis");
                return;
            }
            AuthService.signupWithEmailAndPassword(newUser.email, newUser.password).then(function success(user) {
                var pendingInvite = user.getPendingInvitation();
                if (pendingInvite) {
                    var inviteKey = pendingInvite.key;
                    $state.go("new_invite", {key: inviteKey});
                } else if (isInactive(user)) {
                    $state.go("user_inactive");
                } 
            });
        };

        (function main() {
            if (AuthService.isLoggedIn()) {
                $state.go("app.home");
            }
        })();
    });
})();