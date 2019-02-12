(function () {
    'use strict';

    angular.module("app").component("isEmptyCard", {
        templateUrl: "app/utils/is-empty-card/is-empty-card.html",
        controller: isEmptyCardController,
        controllerAs: "isEmptyCardCtrl",
        bindings: {
            text: "@"
        },
    });

    function isEmptyCardController() {

    }

})();