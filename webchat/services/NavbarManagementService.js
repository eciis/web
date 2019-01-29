(function () {
    'use strict';

    angular.module("webchat").service('NavbarManagementService', ['$mdSidenav', function NavbarManagementService($mdSidenav) {
        const NavbarManagementService = this;

        this.toggleSidenav = (sidenavId) => {
            $mdSidenav(sidenavId).toggle();
        };

    }]);
})();