(function() {
    'use strict';

    const app = angular.module('app');

    app.service('MessageService', function($mdToast) {
        const service = this;

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
    });
})();