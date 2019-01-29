(function () {
    'use strict';

    /**
     * Icon button component that receives an icon and an icon color as a binding.
     * If no icon color was passed, it will be defined to be equals to the default
     * color (#EEE). The on click function should be added by ng-click on the component
     * tag.
     * @class iconButton
     * @example
     * <iconButton icon="someIcon" iconColor="someColor" ng-click="someFunctionCall()"></iconButton>
     */
    angular.module("webchat").component("iconButton", {
        templateUrl: "app/components/icon-button/icon-button.html",
        controller: iconButtonController,
        controllerAs: "iconButtonCtrl",
        bindings: {
            icon: "@",
            iconColor: "@",
        },
    });

    function iconButtonController() {
        const iconButtonCtrl = this;

        iconButtonCtrl.$onInit = () => {
            iconButtonCtrl.iconColor = iconButtonCtrl.iconColor || "#EEE";
        };
    }

})();