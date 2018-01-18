(function() {
    'use strict';
    
    var support = angular.module("support");

    support.controller("ErrorController", function ErrorController($state, $stateParams) {
        var errorCtrl = this;

        errorCtrl.msg = $stateParams.msg;
        errorCtrl.status = $stateParams.status;

        errorCtrl.goToHome = function goToHome() {
            $state.go("support.user.home");
        };
    });
})();