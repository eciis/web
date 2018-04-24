'use strict';

(function () {
    const app = angular.module("app");

    app.controller('ResetPasswordController', function (AuthService, $mdDialog) {
        var resetCtrl = this;

        resetCtrl.email = '';
        resetCtrl.showConfirmedRest = false;

        resetCtrl.resetPassword = function resetPassword() {
            AuthService.resetPassword(resetCtrl.email);
            resetCtrl.showConfirmedRest = true;
        };

        resetCtrl.closeResetDialog = function closeResetDialog() {
            $mdDialog.hide();
        };
    });
})();