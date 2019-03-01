(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('mainController', ['AuthService', function mainController (AuthService) {
        const mainCtrl = this;

        mainCtrl.user = AuthService.getCurrentUser();
    }]);

})();