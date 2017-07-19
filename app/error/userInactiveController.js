'use strict';

(function() {
    var app = angular.module("app");
    
    app.controller("UserInactiveController", function UserInactiveController(AuthService) {
        var userInactiveCtrl = this;

        /*TODO: Change to AuthService.getCurrentUser()
          @author: Tiago Pereira 19/07/2017
          */
        Object.defineProperty(userInactiveCtrl, 'user', {
            get: function() {
                return AuthService.user;
            }
        });

        /*
        * To implement this function when search of institution finished
        */
        userInactiveCtrl.requestInvite = function() {

        };

        userInactiveCtrl.logout = function logout() {
            AuthService.logout();
        };
    });
})();