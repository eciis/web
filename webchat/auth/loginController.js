(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('LoginController', function LoginController (AuthService, $state) {
        const controller = this;

        controller.success = () => {
          $state.go('webchat.home');
        }

        controller.$onInit = () => {
          if (AuthService.isLoggedIn()) {
            $state.go('webchat.home');
          }
        }
    });
})();
