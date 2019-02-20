(function () {
    'use strict';

    angular.module("app").component("institutionShowcase", {
        templateUrl: "app/institution/institutionShowcase/institutionShowcase.html",
        controller: institutionShowcaseController,
        controllerAs: "institutionShowcaseCtrl",
        bindings: {
            institution: "<",
        },
    });

    function institutionShowcaseController() {
        const institutionShowcaseCtrl = this;
    }

})();