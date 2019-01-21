(function() {
    "use strict";

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
