(function () {
    'use strict';

    angular.module("webchat").component("contactsList", {
        templateUrl: "app/components/contacts/list/contacts-list.html",
        controller: contactsListController,
        controllerAs: "contactsListCtrl",
        bindings: {
            className: "@",
            style: "@",
            ariaLabel: "@",
            searchQuery: "<",
            contacts: "<"
        },
    });

    function contactsListController() {
        const contactsListCtrl = this;

    }

})();