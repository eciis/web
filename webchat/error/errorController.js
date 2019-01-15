'use strict';

(function() {
    const app = angular.module('webchat');

    app.controller('ErrorController', ['$state', '$stateParams', '$window', 'STATES',
      function ErrorController($state, $stateParams, $window, STATES) {
        const errorCtrl = this;

        errorCtrl.msg = $stateParams.msg;
        errorCtrl.status = $stateParams.status;

        errorCtrl.goToHome = function goToHome() {
            $state.go(STATES.home);
        };

        errorCtrl.goToReport = function goToReport() {
            $window.open(`${Config.SUPPORT_URL}/report`);
        }
    }]);
})();
