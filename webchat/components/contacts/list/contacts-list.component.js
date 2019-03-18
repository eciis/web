(function () {
    'use strict';

    /**
     * Contacts showcase. It shows all contacts that were filtered by the searchQuery.
     * It receives a contacts array and a search query as a binding.
     * @class contactsList
     * @example
     * <contactsList contacts="{{ctrl.someContactsArray}" searchQuery="{{ctrl.someSearchQuery}}"></contactsList>
     */
    angular.module("webchat").component("contactsList", {
        templateUrl: "app/components/contacts/list/contacts-list.html",
        controller: contactsListController,
        controllerAs: "contactsListCtrl",
        bindings: {
            searchQuery: "<",
            contacts: "<",
            openChat: "<",
        },
    });

    function contactsListController() {
        const contactsListCtrl = this;

        contactsListCtrl.$postLink = () => {
            contactsListCtrl.updateMessage();
        };

        contactsListCtrl.$onChange = (obj) => {
            contactsListCtrl.updateMessage();
        };

        contactsListCtrl.updateMessage = () => {
            contactsListCtrl.isMessageShown = contactsListCtrl.contacts.length === 0;
        };
    }

})();