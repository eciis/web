(function () {
    'use strict';

    angular.module("webchat").component("contactsToolbar", {
        templateUrl: "app/components/contacts/toolbar/contacts-toolbar.html",
        controller: contactsToolbarController,
        controllerAs: "contactsToolbarCtrl",
        bindings: {
            className: "@",
            style: "@",
            ariaLabel: "@",
            searchQuery: "="
        },
    });

    function contactsToolbarController($mdSidenav) {
        const contactsToolbarCtrl = this;

        contactsToolbarCtrl.toggleNavbar = (componentId) => {
            $mdSidenav(componentId).toggle();
        };

    }

})();