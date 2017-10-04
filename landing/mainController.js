'use strict';
(function() {
    var landing = angular.module('landing');
    
    landing.controller("MainController", function MainController($location, $anchorScroll) {
        var mainCtrl = this;

        mainCtrl.scroll = function scroll(section) {
            $location.hash(section);
            $anchorScroll();
        };

        mainCtrl.isSection = function isSection(section) {
            console.log($location.hash);
            return $location.hash;
        };
    });
})();