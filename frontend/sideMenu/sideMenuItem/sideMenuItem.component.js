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

        smItemCtrl.getSelectedClass = _ => {
            return $state.current.name === STATES[smItemCtrl.item.stateName] ? "selected" : "";
        };

        smItemCtrl.close = () => {
            $mdSidenav('sideMenu').close();
        };

        smItemCtrl.show = _ => {
            return smItemCtrl.item.showIf ? smItemCtrl.item.showIf() : true; 
        };
    };
})();