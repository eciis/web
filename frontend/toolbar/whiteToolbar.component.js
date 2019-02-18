'use strict';

(function () {
    const app = angular.module("app");

    app.component('whiteToolbar', {
        templateUrl: 'app/toolbar/white_toolbar_mobile.html',
        controller: ['$window', WhiteToolbarController],
        controllerAs: 'whiteToolbarCtrl',
        bindings: {
            title: '@'
        }
    });

    function WhiteToolbarController($window) {
        const whiteToolbarCtrl = this;

        whiteToolbarCtrl.goBack = () => {
            return $window.history.back();
        };
    }
})();   