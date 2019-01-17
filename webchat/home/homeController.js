(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('HomeController', ['WebchatService', function HomeController (WebchatService) {
        const homeCtrl = this;

        homeCtrl.user = WebchatService.getCurrentUser();
        homeCtrl.contacts = WebchatService.getContacts();

    }]);

})();