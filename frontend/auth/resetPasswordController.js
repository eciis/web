'use strict';

(function () {
    const app = angular.module("app");

    app.controller('ResetPasswordController', function (AuthService, $state, $scope) {
        var resetCtrl = this;

        resetCtrl.email = '';
        resetCtrl.emailSent = false;

        resetCtrl.resetPassword = function () {
            AuthService.resetPassword(resetCtrl.email)
            .then(_ => {
                resetCtrl.emailSent = true;
                $scope.$apply();
            }).catch(err => console.error(err));
        };
        
        resetCtrl.return = function () {
            $state.go("signin");
        };

        resetCtrl.getMessage = function () {
            const firstMsg = "Redefinir sua senha";
            const secondMsg = `Você receberá dentro de instantes no e-mail ${resetCtrl.email} um link para redefinição da senha.`;
            return resetCtrl.emailSent ? secondMsg : firstMsg;
        }
    });
})();