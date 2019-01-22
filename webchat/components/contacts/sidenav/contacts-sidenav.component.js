(function () {
    'use strict';

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