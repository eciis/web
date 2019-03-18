(function() {
    "use strict";

    angular
    .module('app')
    .factory("EntityShowcase", function () {
        const factory = {};

        /**
         * Generates an object with the properties used to create an rightIconBtn
         * in the EntityShowCase component
         * @param {string} - icon tho be showed as a button
         * @param {string} - color of the icon, if not defined it is set to a default one
         * @param {function} - action function to be called when the button is clicked
         * @param {array} - params that will be necessary to action function to be called
         * @param {boolean} - hideBtn flag used to hide the button if true
         */
        factory.createIconBtn = (icon, color, action, params, hideBtn) => {
            const greyColor = '#9E9E9E';
            return {
                icon: icon,
                iconColor: color || greyColor,
                action: () => action(...params),
                showIf: () => hideBtn === undefined ? true : hideBtn
            };
        };

        return factory;
    });
})();