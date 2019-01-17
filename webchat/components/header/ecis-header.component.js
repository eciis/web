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
            className: "@",
            style: "@",
            ariaLabel: "@",
            mdColors: "@",
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
