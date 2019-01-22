(function () {
    'use strict';

    /**
     * Responsive logo component. When the screen is smaller than 320px wide,
     * height will be changed to a smaller size. When the screen is smaller
     * than 450px wide, the logo will change to the responsive one. And when
     * the logo is bigger than 450px wide, the logo will change to the default
     * one. It doesn't need any binding to work properly.
     * @class logo
     * @example
     * <logo></logo>
     */
    angular.module("webchat").component("logo", {
        templateUrl: "app/components/logo/logo.html",
        controller: logoController,
        controllerAs: "logoCtrl",
    });

    function logoController() {
        const logoCtrl = this;

    }

})();