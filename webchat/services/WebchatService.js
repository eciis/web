(function () {
    'use strict';

    angular.module("webchat").service('WebchatService', function WebchatService() {
        const WebchatService = this;

        WebchatService.getCurrentUser = () => (
            {name: "Name", description: "Description", avatar: "https://www.w3schools.com/howto/img_avatar.png"}
        );

        WebchatService.getContacts = () => {
            const contactsList = [];
            const numContacts = 30;

            for (let i = 0; i < numContacts; i++) {
                contactsList.push(WebchatService.getCurrentUser());
            }

            return contactsList;
        };


    });
})();