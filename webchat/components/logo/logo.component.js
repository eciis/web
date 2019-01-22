(function () {
    'use strict';

    angular.module("webchat").component("logo", {
        templateUrl: "app/components/logo/logo.html",
        controller: logoController,
        controllerAs: "logoCtrl",
    });

    function logoController() {
        const logoCtrl = this;

    }

})();