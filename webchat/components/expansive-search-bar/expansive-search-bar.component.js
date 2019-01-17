(function () {
    'use strict';

    angular.module("webchat").component("expansiveSearchBar", {
        templateUrl: "app/components/expansive-search-bar/expansive-search-bar.html",
        controller: expansiveSearchBarController,
        controllerAs: "expansiveSearchBarCtrl",
        bindings: {
            className: "@",
            style: "@",
            ariaLabel: "@",
            searchQuery: "="
        },
    });

    function expansiveSearchBarController() {
        const expansiveSearchBarCtrl = this;

        expansiveSearchBarCtrl.isExpanded = false;

        expansiveSearchBarCtrl.toggleSearch = () => expansiveSearchBarCtrl.isExpanded = !expansiveSearchBarCtrl.isExpanded;

    }

})();