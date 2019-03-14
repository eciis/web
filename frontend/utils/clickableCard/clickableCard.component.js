(function () {
    "use strict";

    /**
     * Component used to render a card that opens or closes when clicked.
     * It receives an icon and title to be showed at the card header,
     * and the flag isOpen, that changes the initial state of the card
     * to open or closed, its default value is 'false'. Implicitly, 
     * it also receives any template that will be rendered inside the card.
     * 
     * @class clickableCard
     * @example
     * <clickable-card icon="someIcon" title="someTitle" is-open="true">
     *  <any-template></any-template>
     * </clickable-card>
     */
    angular
    .module('app')
    .component("clickableCard", {
        templateUrl: 'app/utils/clickableCard/clickable_card.html',
        controller: ClickableCardController,
        controllerAs: 'clickableCardCtrl',
        bindings: {
            icon: '@',
            showNotification: '<',
            title: '@',
            isOpen: '<'
        },
        transclude: true
    });

    function ClickableCardController() {
        const clickableCardCtrl = this;

        clickableCardCtrl.$onInit = () => {
            _.defaults(clickableCardCtrl, {
                isOpen: false
            });
        };

        /**
         * It opens or closes the card content depending
         * on the previous value of the isOpen flag
         */
        clickableCardCtrl.onClick = () => {
            clickableCardCtrl.isOpen = !clickableCardCtrl.isOpen;
        }
    }

})();