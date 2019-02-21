"use strict";

(function () {
    angular
    .module('app')
    .component("clickableCard", {
        templateUrl: 'app/utils/clickableCard/clickable_card.html',
        controller: ClickableCardController,
        controllerAs: 'clickableCardCtrl',
        bindings: {
            icon: '@',
            title: '@'
        },
        transclude: true
    });

    function ClickableCardController() {
        const clickableCardCtrl = this;

        clickableCardCtrl.$onInit = () => {
            Object.assign(clickableCardCtrl, {
                isOpen: false
            });
        };

        clickableCardCtrl.onClick = () => {
            clickableCardCtrl.isOpen = !clickableCardCtrl.isOpen;
        }
    }

})();