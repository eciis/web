(function () {
    'use strict';

    /**
     * Contacts sidenav toolbar. It is composed by an expansive search bar and a
     * button that only is shown on mobile. This button is used to toggle the left
     * navbar. It receives a search query as a binding (Two way data-binding).
     * @class contactsToolbar
     * @example
     * <contactsToolbar searchQuery="{{ctrl.someSearchQuery}}"></contactsToolbar>
     */
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