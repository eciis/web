(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('VideoController', function VideoController ($scope, $state) {
        const controller = this;

        const main = () => {
            console.log('VideoController running');
        };

        main();

    });

})();