(function () {
    'use strict';

    angular.module("app").component("entityShowcase", {
        templateUrl: "app/utils/entityShowcase/entityShowcase.html",
        controller: entityShowcaseController,
        controllerAs: "entityShowcaseCtrl",
        bindings: {
            avatar: "<",
            title: "<",
            subtitle: "<",
        },
    });

    function entityShowcaseController() {
        const entityShowcaseCtrl = this;
    }

})();