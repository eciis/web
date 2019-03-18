(function() {
    'use strict';

    const app = angular.module('app');

    app.service('MessageService', ['$mdToast', function($mdToast) {
        const service = this;
        const SCREEN_SIZES = {
            SMARTPHONE: 475
        };

        /**
         * This function displays a small dialog containing the received message per parameter.
         * @param {String} message - Message to show
         */
        function showToast(message) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        };

        /** Show toast with infomation message when not in mobile. 
         */
        service.showInfoToast = function showInfoToast(message){
            !Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE) && showToast(message);
        }

        /** Show toast with error message. 
         */
        service.showErrorToast = function showErrorToast(message){
            showToast(message);
        }
    }]);
})();