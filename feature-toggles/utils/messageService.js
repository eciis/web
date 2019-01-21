(function() {
    'use strict';

    const app = angular.module('app');

    app.service('MessageService', ['$mdToast', function($mdToast) {
        const service = this;

        /**
         * This function displays a small dialog containing the received message per parameter.
         * @param {String} message - Message to show
         */
        service.showToast = function showToast(message) {
            $mdToast.show(
                $mdToast.simple()
                    .textContent(message)
                    .action('FECHAR')
                    .highlightAction(true)
                    .hideDelay(5000)
                    .position('bottom right')
            );
        };
    }]);
})();