(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('WebchatController', ['WebchatService', function WebchatController (WebchatService) {
        const webchatCtrl = this;

        webchatCtrl.user = WebchatService.getCurrentUser();
    }]);

})();