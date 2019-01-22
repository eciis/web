(function () {
    'use strict';

    /**
     * Contacts sidenav. It is composed by an contacts list and a contacts toolbar.
     * It receives a contacts array that is going to be passed to the contacts list
     * component.
     * @class contactsSidenav
     * @example
     * <contactsSidenav contacts="{{ctrl.someContactsArray}}"></contactsSidenav>
     */
    angular.module("webchat").component("contactsSidenav", {
        templateUrl: "app/components/contacts/sidenav/contacts-sidenav.html",
        controller: contactsSidenavController,
        controllerAs: "contactsSidenavCtrl",
        bindings: {
            contacts: "<",
        },
    });

    function contactsSidenavController() {
        const contactsSidenavCtrl = this;
        contactsSidenavCtrl.searchQuery = "";

    }

})();