(function() {
    "use strict";
    
    /**
     * Institutional links Component
     * @param {function} predicate to determine whether the component should be loaded or not
     * @param {string} title to be showed over the links
     * @param {array} linked institutions
     * @param {function} callback to be called when one item is clicked
     * @param {function} callback to be called on each link to determine its current status
     */
    angular
    .module("app")
    .component("instLinks", {
        controller: () => {},
        controllerAs: "linksCtrl",
        templateUrl: "app/institution/institutionalLinks/instLinks/inst_links.html",
        bindings: {
            showIf: "<",
            title: "@",
            institutions: "<",
            onClick: "<",
            checkStatus: "<"
        }
    });
})();
