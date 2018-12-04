(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('ChatController', function ChatController ($scope, $state) {
        const controller = this;

        const main = () => {
            console.log('ChatController running');
        };

        main();

    });

})();