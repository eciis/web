(function () {
    'use strict';

    angular.module("webchat").component("logo", {
        templateUrl: "app/components/logo/logo.html",
        controller: logoController,
        controllerAs: "logoCtrl",
        bindings: {
            className: "@",
            style: "@",
            ariaLabel: "@",
        },
    });

    function logoController() {
        const logoCtrl = this;

    }

})();