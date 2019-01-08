(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('WebchatController', function WebchatController ($scope, $state) {
        const controller = this;

        const main = () => {
            console.log('WebchatController running');
        };

        main();

    });

})();