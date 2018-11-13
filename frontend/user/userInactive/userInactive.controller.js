'use strict';

(function() {
    var app = angular.module("app");

    app.controller("UserInactiveController", function UserInactiveController(AuthService, $state) {
        var userInactiveCtrl = this;

        
        userInactiveCtrl.institutions = [];
        userInactiveCtrl.requestsOfSelectedInst = [];
        userInactiveCtrl.request = null;
        userInactiveCtrl.selectedInst = {};

        userInactiveCtrl.getMessage = function () {
            const fistMsg = "Busque uma instituição que você faz parte.";
            return fistMsg;
        };

        userInactiveCtrl.logout = function () {
            AuthService.logout();
        };

        userInactiveCtrl.isInstSelected = function () {
            return !angular.equals(userInactiveCtrl.selectedInst, {});
        };
        
        userInactiveCtrl.onSelect = function (selectedInst) {
            userInactiveCtrl.selectedInst = selectedInst;
        };
        
        userInactiveCtrl.onSearch = function (institutions) {
            userInactiveCtrl.selectedInst = {};
        };
        
        userInactiveCtrl.advance = function () {
            $state.go("user_request", { institution: userInactiveCtrl.selectedInst });
        };
    
    });
})();