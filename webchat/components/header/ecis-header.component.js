(function () {
    'use strict';

    /**
     * E-cis header that is composed by a logo, an user description of the current
     * user, and two buttons one to open the sidenav on mobile and another one to
     * logout. It receives an user object as a binding.
     * @class ecisHeader
     * @example
     * <ecisHeader user="{{ctrl.someUser}}"></ecisHeader>
     */
    angular.module('webchat').component('ecisHeader', {
        templateUrl: "app/components/header/ecis-header.html",
        controller: [
            'AuthService',
            'NavbarManagementService',
            headerController,
        ],
        controllerAs: "headerCtrl",
        bindings: {
            user: "<"
        },
    });

    function headerController (AuthService, NavbarManagementService) {
        const headerCtrl = this;

        headerCtrl.toggleNavbar = () => {
            NavbarManagementService.toggleSidenav('left');
        };

        headerCtrl.logout = () => {
            AuthService.logout();
        };
    }
})();
