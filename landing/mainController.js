'use strict';
(function() {
    var landing = angular.module('landing');
    
    landing.controller("MainController", function MainController() {
        var mainCtrl = this;

        mainCtrl.login = function login() {
            window.open('http://localhost:8081/app/');
        };
    });
})();