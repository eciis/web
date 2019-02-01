'use strict';

(function () {
    const app = angular.module('app');

    app.component("mainToolbar", {
        templateUrl: 'app/toolbar/main_toolbar.html',
        controller: 'MainToolbarController',
        controllerAs: 'mainToolbarCtrl',
        bindings: {
            title: '=',
            toolbarMenuItems: '=',
            toolbarSimpleItems: '=',
            noSearch: '='
        }
    });

    app.controller('MainToolbarController', function MainToolbarController($mdSidenav, STATES, 
        $state, SCREEN_SIZES, $timeout) {
        const mainToolbarCtrl = this;

        mainToolbarCtrl.states = STATES;

        mainToolbarCtrl.changeState = (state, params) => {
            $state.go(state, params);
        };

        mainToolbarCtrl.toggle = function toggle() {
            $mdSidenav('sideMenu').toggle();
        };

        mainToolbarCtrl.isMobileScreen = () => {
            return Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE);
        };

        $timeout(() => {
            const searchElement = document.getElementById('bla');
            if (!mainToolbarCtrl.toolbarSimpleItems) {
                searchElement.setAttribute('style', "justify-self: end;");
                console.log(searchElement);
            }
        }, 0)

        mainToolbarCtrl.$onInit = () => {
            console.log(mainToolbarCtrl.toolbarMenuItems);
        };
    });
})();