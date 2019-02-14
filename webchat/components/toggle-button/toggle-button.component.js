(function () {
    'use strict';

    /**
     * Button that calls an action and changes its icon on click.
     * It receives as a binding an icon to shown when on and an
     * icon to show when off. Also it receives an action to be
     * called on click and the icons color when on and off. If
     * the icon color is not passed, its color will be a default
     * one (#EEE).
     * @class toggleButton
     * @example
     * <toggle-button
     *     icon-on="anIcon"
     *     icon-off="anotherIcon"
     *     icon-color-on="aColor"
     *     icon-color-off="anotherColor"
     *     action="anAction">
     *</toggle-button>
     *
     */
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

        Object.defineProperty(toggleButtonCtrl, 'activeIcon', {
            get: () => {
                return toggleButtonCtrl.active ? toggleButtonCtrl.iconOn : toggleButtonCtrl.iconOff;
            },
        });

        Object.defineProperty(toggleButtonCtrl, 'activeIconColor', {
            get: () => {
                return toggleButtonCtrl.active ? toggleButtonCtrl.iconColorOn : toggleButtonCtrl.iconColorOff;
            },
        });
    }

})();