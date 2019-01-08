"use strict";

(function () {
    angular
    .module('app')
    .component("sideMenuItem", {
        templateUrl: "app/sideMenu/sideMenuItem/side_menu_item.html",
        controller: sideMenuItemController,
        controllerAs: "smItemCtrl",
        bindings: {
            item: "<"
        }
    });

    function sideMenuItemController($state, $mdSidenav, STATES) {

        const smItemCtrl = this;

        smItemCtrl.getSelectedClass = stateName => {
            return $state.current.name === STATES[stateName] ? "selected" : "";
        };

        smItemCtrl.close = () => {
            $mdSidenav('sideMenu').close();
        };

        smItemCtrl.show = _ => {
            return smItemCtrl.item.showIf ? smItemCtrl.item.showIf() : true; 
        };
    };
})();