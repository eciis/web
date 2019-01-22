(function () {
    'use strict';

    angular.module("webchat").component("contactsToolbar", {
        templateUrl: "app/components/contacts/toolbar/contacts-toolbar.html",
        controller: [
            'NavbarManagementService',
            contactsToolbarController,
        ],
        controllerAs: "contactsToolbarCtrl",
        bindings: {
            searchQuery: "="
        },
    });

    function contactsToolbarController(NavbarManagementService) {
        const contactsToolbarCtrl = this;

        contactsToolbarCtrl.toggleNavbar = () => {
            NavbarManagementService.toggleSidenav('left');
        };

    }

})();