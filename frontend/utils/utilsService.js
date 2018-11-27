'use strict';

(function() {
    angular
    .module('app')
    .service('UtilsService', function ($state, $mdSidenav) {
        const service = this;

        service.selectNavOption = function (state, params, callback) {
            $state.go(state, params || {});
            $mdSidenav('leftNav').toggle();
            if (callback) callback(state);
        };
    });
})();