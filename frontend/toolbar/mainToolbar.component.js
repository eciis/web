'use strict';

(function () {
    const app = angular.module('app');

    app.component("mainToolbar", {
        templateUrl: 'app/toolbar/main_toolbar.html',
        controller: 'MainToolbarController',
        controllerAs: 'mainToolbarCtrl',
        bindings: {
            title: '='
        }
    });

    app.controller('MainToolbarController', function MainToolbarController() {
        const mainToolbarCtrl = this;
    });
})();