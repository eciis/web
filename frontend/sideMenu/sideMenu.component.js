'use strict';

(function() {
    angular
    .module('app')
    .component('sideMenu', {
        templateUrl: "app/sideMenu/sideMenu.html",
        controller: sideMenuController,
        controllerAs: "sideMenuCtrl",
        bindings: {
            options: '<'
        }
    });

    function sideMenuController() {
        const sideMenuCtrl = this;

        const options = [];
    }
})();