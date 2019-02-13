'use strict';

(function () {
    const app = angular.module('app');

    /**
     * Generic component responsible for providing the toolbar to the application
     * in mobile devices.
     *  {string} title -- the screen title
     *  {array} toolbarMenuItems -- toolbar items, each one with specific options and actions
     *  {object} toolbarGeneralOptions -- toolbar extra options, it stands in the last button's menu
     *      and cover some extra actions like refresh the page.
     *  {string} noSearch -- it tells to the component if there is or not search button.
     *  {string} sortByAlpha -- another flag that indicates if there sort button or not
     *  {function} sortFunc -- the sort function
     */
    app.component("mainToolbar", {
        templateUrl: 'app/toolbar/main_toolbar_mobile.html',
        controller: ['$mdSidenav', 'STATES', '$state', 'SCREEN_SIZES', 
            '$timeout', MainToolbarController],
        controllerAs: 'mainToolbarCtrl',
        bindings: {
            title: '@',
            toolbarMenuItems: '=',
            toolbarGeneralOptions: '=',
            noSearch: '=',
            sortByAlpha: '=',
            sortFunc: '='            
        }
    });

    function MainToolbarController($mdSidenav, STATES, $state, SCREEN_SIZES, $timeout) {
        const mainToolbarCtrl = this;

        mainToolbarCtrl.states = STATES;

        /**
         * It changes the current state to the new one with the params received.
         * @param {String} state -- the new state
         * @param {object} params -- the state's params 
         */
        mainToolbarCtrl.changeState = (state, params) => {
            $state.go(state, params);
        };

        /**
         * Show or hide the sidebar.
         */
        mainToolbarCtrl.toggleSidenav = function toggleSidenav() {
            $mdSidenav('sideMenu').toggle();
        };

        /**
         * Returns true if the application is being used by a mobile
         */
        mainToolbarCtrl.isMobileScreen = () => {
            return Utils.isMobileScreen(SCREEN_SIZES.SMARTPHONE);
        };

        /**
         * It calls the item's action.
         * If there is search button it changes the item's title,
         * otherwise, the page is notification, and the options' color
         * is changed.
         * @param {object} item
         * @param {string} option
         */
        mainToolbarCtrl.handleOptionAction = (item, option) => {
            item.action(option);
            if (!mainToolbarCtrl.noSearch) {
                item.title = option;
            } else {
                const menuOption = document.getElementById(option);
                menuOption && menuOption.setAttribute('style', "color: #009688;");
                const previousOption = document.getElementById(mainToolbarCtrl.previousMenuOption);
                previousOption && previousOption.setAttribute('style', 'color: black');
                mainToolbarCtrl.previousMenuOption = option;
            }
        };

        /**
         * It just reverse the sort param or set it to name if it is not set yet.
         * Then, the sort function is called.
         */
        mainToolbarCtrl.sort = () => {
            const invertSortParam = {
                'name': '-name',
                '-name': 'name'
            };

            mainToolbarCtrl.sortParam = invertSortParam[mainToolbarCtrl.sortParam] || 'name';
            mainToolbarCtrl.sortFunc(mainToolbarCtrl.sortParam);
        };

        $timeout(() => {
            const searchElement = document.getElementById('search-toolbar-element');
            if (!mainToolbarCtrl.toolbarGeneralOptions && searchElement) {
                searchElement.style.justifySelf = 'end';
            }
        }, 0)

    }

})();