'use strict';

(function() {
    var app = angular.module("app");

    app.controller("ErrorController", function ErrorController($state, $stateParams, $window, STATES) {
        var errorCtrl = this;

        errorCtrl.msg = $stateParams.msg;
        errorCtrl.status = $stateParams.status;

        errorCtrl.goToHome = function goToHome() {
            $state.go(STATES.HOME);
        };

        errorCtrl.goToReport = function goToReport() {
            $window.open("http://support.plataformacis.org/report");
        }
    });
})();