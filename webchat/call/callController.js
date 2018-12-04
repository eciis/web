(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('CallController', function CallController ($scope, $state) {
        const controller = this;

        const main = () => {
            console.log('CallController running');
        };

        main();

    });

})();