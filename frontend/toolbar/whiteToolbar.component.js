
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

        /**
         * Redirect the user to the previous page.
         */
        whiteToolbarCtrl.goBack = () => {
            return $window.history.back();
        };

        /**
        * Returns true if the application is being used by a mobile
        */
        whiteToolbarCtrl.isMobileScreen = () => {
            return Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE);
        };
    }
})();   