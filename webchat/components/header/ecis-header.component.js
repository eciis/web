(function () {
    'use strict';

    angular.module('webchat').component('ecisHeader', {
        templateUrl: "app/components/header/ecis-header.html",
        controller: [
            'NavbarManagementService',
            headerController,
        ],
        controllerAs: "headerCtrl",
        bindings: {
            user: "<"
        },
    });

    function headerController (NavbarManagementService) {
        const headerCtrl = this;

        headerCtrl.toggleNavbar = () => {
            NavbarManagementService.toggleSidenav('left');
        };
    }
})();
