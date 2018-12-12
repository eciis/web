(function () {
    'use strict';

    const webchat = angular.module('webchat');

    webchat.controller('HomeController', function HomeController ($scope, $state) {
        const controller = this;

        const main = () => {
            console.log('HomeController running');
            console.log('Redirecting to login');
            $state.go('login')
        };

        main();

    });

})();
