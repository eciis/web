(function () {
    'use strict';

    /**
     * Component that is shown when something is empty and in the error page.
     * It's shows a default image and a text that it receives as a binding.
     * @class isEmptyCard
     * @example
     * <is-empty-card text="Card is empty" ng-if="conditionToBeEmpty"></is-empty-card>
     */
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