(function () {
    'use strict';

    angular.module("webchat").component("toggleButton", {
        templateUrl: "app/components/toggle-button/toggle-button.html",
        controller: toggleButtonController,
        controllerAs: "toggleButtonCtrl",
        bindings: {
            iconOn: '@',
            iconOff: '@',
            iconColorOn: '@',
            iconColorOff: '@',
            action: '<',
        },
    });

    function toggleButtonController() {
        const toggleButtonCtrl = this;

        toggleButtonCtrl.$onInit = () => {
            toggleButtonCtrl.active = true;
            toggleButtonCtrl.iconColorOff = toggleButtonCtrl.iconColorOff || '#EEE';
            toggleButtonCtrl.iconColorOn = toggleButtonCtrl.iconColorOn || '#EEE';
        };

        toggleButtonCtrl.toggle = () => {
            toggleButtonCtrl.active = !toggleButtonCtrl.active;
            toggleButtonCtrl.action();
        };
    }

})();