'use strict';

(function () {
    const app = angular.module('app');

    app.component("mainToolbar", {
        templateUrl: 'app/toolbar/main_toolbar_mobile.html',
        controller: 'MainToolbarController',
        controllerAs: 'mainToolbarCtrl',
        bindings: {
            title: '=',
            toolbarMenuItems: '=',
            toolbarGeneralOptions: '=',
            noSearch: '=',
            sortByAlpha: '=',
            sortFunc: '='            
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

        mainToolbarCtrl.handleOptionAction = (item, option) => {
            item.action(option);
            if(!mainToolbarCtrl.noSearch) {
                item.title = option;
            } else {
                const menuOption = document.getElementById(option);
                menuOption && menuOption.setAttribute('style', "color: #009688;");
                const previousOption = document.getElementById(mainToolbarCtrl.previousMenuOption);
                previousOption && previousOption.setAttribute('style', 'color: black');
                mainToolbarCtrl.previousMenuOption = option;
            }
        };

        mainToolbarCtrl.sort = () => {
            if(!mainToolbarCtrl.sortParam || mainToolbarCtrl.sortParam === '-name') {
                mainToolbarCtrl.sortParam = 'name';
            } else {
                mainToolbarCtrl.sortParam = '-name';
            }
            mainToolbarCtrl.sortFunc(mainToolbarCtrl.sortParam);
        };

        $timeout(() => {
            const searchElement = document.getElementById('search-toolbar-element');
            if (!mainToolbarCtrl.toolbarGeneralOptions && searchElement) {
                searchElement.style.justifySelf = 'end';
            }
        }, 0)
        
    });
})();