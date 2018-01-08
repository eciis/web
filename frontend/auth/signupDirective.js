(function() {
    'use strict';
    
    var app = angular.module('app');
    
    app.controller('SignupController', function() {
        var controller = this;
    });

    app.directive("signup", function() {
        return {
            restrict: 'E',
            templateUrl: "app/auth/signup.html",
            controller: "SignupController",
            controllerAs: "controller",
            bindToController: {
                returnAction: '='
            }
        };
    });
})();