(function () {
    'use strict';

    /**
     * Expansive search bar that receives as binding an search query (two way data-binding)
     * and modify it according to its input.
     * @class expansiveSearchBar
     * @example
     * <expansiveSearchBar searchQuery="{{ctrl.searchQuery}}></expansiveSearchBar>
     */
    angular.module("webchat").component("expansiveSearchBar", {
        templateUrl: "app/components/expansive-search-bar/expansive-search-bar.html",
        controller: expansiveSearchBarController,
        controllerAs: "expansiveSearchBarCtrl",
        bindings: {
            searchQuery: "="
        },
    });

    function expansiveSearchBarController() {
        const expansiveSearchBarCtrl = this;

        expansiveSearchBarCtrl.isExpanded = false;

        expansiveSearchBarCtrl.toggleSearch = () => expansiveSearchBarCtrl.isExpanded = !expansiveSearchBarCtrl.isExpanded;

    }

})();