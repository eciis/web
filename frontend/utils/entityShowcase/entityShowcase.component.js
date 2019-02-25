(function () {
    'use strict';

    angular.module("app").component("entityShowcase", {
        templateUrl: "app/utils/entityShowcase/entityShowcase.html",
        controller: entityShowcaseController,
        controllerAs: "entityShowcaseCtrl",
        bindings: {
            avatar: "<",
            icon: "@",
            title: "<",
            subtitle: "<",
            leftAction: "<",
            rightIconBtns: "<",
        },
    });

    function entityShowcaseController() {
        const entityShowcaseCtrl = this;

        entityShowcaseCtrl.showIcon = () => !_.isNil(entityShowcaseCtrl.icon);
    }

})();