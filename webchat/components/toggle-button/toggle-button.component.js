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
            console.log(toggleButtonCtrl);
            _.defaults(toggleButtonCtrl, {
                active: true,
                iconColorOn: "#EEE",
                iconColorOff: "#EEE",
                action: () => {}
            });
            console.log(toggleButtonCtrl);
        };

        toggleButtonCtrl.toggle = () => {
            toggleButtonCtrl.active = !toggleButtonCtrl.active;
            toggleButtonCtrl.action();
        };
    }

})();