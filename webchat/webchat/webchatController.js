(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('WebchatController', ['AuthService', function WebchatController (AuthService) {
        const webchatCtrl = this;

        webchatCtrl.user = AuthService.getCurrentUser();
    }]);

})();