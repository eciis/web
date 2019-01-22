(function () {
    'use strict';

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