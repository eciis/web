(function() {
    'use strict';
    
    var app = angular.module('app');
    
    app.controller('SignupController', function(AuthService, $scope, MessageService) {
        var controller = this;

        controller.newUser = {};
 
        controller.signup = function signup() {
            if (controller.beforeStart) {
                controller.beforeStart();
            }
            var newUser = controller.newUser;
            if (newUser.password !== newUser.verifypassword) {
                MessageService.showToast("Senhas incompatíveis");
                return;
            }
            AuthService.signupWithEmailAndPassword(
                newUser.email, 
                newUser.password
            ).then(controller.callback, controller.errorHandler);
        };

        (function main() {
            if ($scope.emailDisabled) {
                controller.newUser.email = $scope.email;
            }
        })();
    });

    app.directive("signup", function() {
        return {
            restrict: 'E',
            templateUrl: "app/auth/signup.html",
            controller: "SignupController",
            controllerAs: "controller",
            scope: {
                cardTitle: '@',
                emailDisabled: '=',
                email: '='
            },
            bindToController: {
                returnAction: '=',
                beforeStart: '=',
                callback: '=',
                errorHandler: '='
            }
        };
    });
})();