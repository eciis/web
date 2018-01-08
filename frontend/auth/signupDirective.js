(function() {
    'use strict';
    
    var app = angular.module('app');
    
    app.controller('SignupController', function(AuthService) {
        var controller = this;

        controller.newUser = {};

        controller.signup = function signup() {
            var newUser = controller.newUser;
            if (newUser.password !== newUser.verifypassword) {
                MessageService.showToast("Senhas incompatíveis");
                return;
            }
            AuthService.signupWithEmailAndPassword(
                newUser.email, 
                newUser.password
            ).then(controller.callback);
        };
    });

    app.directive("signup", function() {
        return {
            restrict: 'E',
            templateUrl: "app/auth/signup.html",
            controller: "SignupController",
            controllerAs: "controller",
            bindToController: {
                returnAction: '=',
                callback: '='
            }
        };
    });
})();