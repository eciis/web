'use strict';

(function() {
    angular
    .module('app')
    .service('UtilsService', function ($state, $mdSidenav) {
        const service = this;

        /**
         * Select a sideNav option, go to the select state
         * and call a callback function if it is present 
         */
        service.selectNavOption = function (state, params, callback) {
            $state.go(state, params || {});
            $mdSidenav('leftNav').toggle();
            if (callback) callback(state);
        };
    });
})();