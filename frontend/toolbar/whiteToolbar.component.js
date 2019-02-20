
'use strict';

(function () {
    const app = angular.module("app");

    app.component('whiteToolbar', {
        templateUrl: 'app/toolbar/white_toolbar_mobile.html',
        controller: ['$window', 'SCREEN_SIZES', WhiteToolbarController],
        controllerAs: 'whiteToolbarCtrl',
        bindings: {
            title: '@',
            rightButton: '=',
            primaryButtonIcon: '@',
            titleClass: '@'
        }
    });

    function WhiteToolbarController($window, SCREEN_SIZES) {
        const whiteToolbarCtrl = this;

        whiteToolbarCtrl.goBack = () => {
            return $window.history.back();
        };

        whiteToolbarCtrl.isMobileScreen = () => {
            return Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE);
        };
    }
})();   