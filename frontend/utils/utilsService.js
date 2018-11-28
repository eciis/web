'use strict';

(function() {
    angular
    .module('app')
    .service('UtilsService', function ($state, $mdSidenav) {
        const service = this;

        /**
         * Select a sideNav option, close the sideNav
         * and go to the select state
         */
        service.selectNavOption = function (state, params) {
            $state.go(state, params || {});
            $mdSidenav('leftNav').toggle();
        };
    });
})();