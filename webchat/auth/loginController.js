(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('LoginController', function LoginController (AuthService, $state, STATES) {
        const controller = this;

        controller.success = () => {
          $state.go(STATES.home);
        }

        controller.$onInit = () => {
          if (AuthService.isLoggedIn()) {
            $state.go(STATES.home);
          }
        }
    });
})();
