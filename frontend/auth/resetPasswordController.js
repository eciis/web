'use strict';

(function () {
    const app = angular.module("app");

    app.controller('ResetPasswordController', function (AuthService, $state, $scope, MessageService) {
        var resetCtrl = this;

        resetCtrl.email = '';
        resetCtrl.emailSent = false;

        /**
         * It sends a reset password request to the server,
         * if it is successful the flag emailSent is set to true,
         * otherwise, an error message is showed 
         */
        resetCtrl.resetPassword = function () {
            AuthService.resetPassword(resetCtrl.email)
            .then(_ => {
                resetCtrl.emailSent = true;
                $scope.$apply();
            }).catch(_ => {
                MessageService.showToast("Ocorreu um erro, verifique seu e-mail e tente novamente");
            });
        };
        
        /**
         * It returns the user to the singin page
         */
        resetCtrl.return = function () {
            $state.go("signin");
        };

        /**
         * It returns the appropriate message depending on whether
         * the user has already sent the e-mail reset request or not
         */
        resetCtrl.getMessage = function () {
            const firstMsg = "Redefinir sua senha";
            const secondMsg = `Você receberá dentro de instantes no e-mail ${resetCtrl.email} um link para redefinição da senha.`;
            return resetCtrl.emailSent ? secondMsg : firstMsg;
        }
    });
})();