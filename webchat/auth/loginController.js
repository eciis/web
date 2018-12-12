(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('LoginController', function LoginController ($scope, $state) {
        const controller = this;

        controller.success = () => {
          console.log('Login done');
        }

        const main = () => {
            console.log('LoginController running');
        };

        main();

    });

})();
