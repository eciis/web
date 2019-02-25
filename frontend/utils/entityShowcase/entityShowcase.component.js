(function () {
    'use strict';

    /**
     * Component that shows an entity (user or institution). It receives a title (entity name),
     * an subtitle (an entity information) and a avatar (the image to be shown). Also it could
     * receive an icon in case the entity doesn't have an avatar url. It could receive an left
     * action that will be triggered when the user clicks on the avatar or the icon and a array
     * of rightIconBtns objects that has a icon, a icon-color and a action. You should use one
     * icon or one avatar, and not both of them.
     * rightIconBtns example:
     * [
     *      {
     *          icon: aIcon,
     *          iconColor: aIconColor,
     *          action: aAction,
     *      },
     * ]
     * @class entityShowcase
     * @example
     * <entityShowcase
     *      avatar="aPhoto"
     *      icon="aIcon"
     *      title="aTitle"
     *      subtitle="aSubtitle"
     *      leftAction="aAction"
     *      rightIconBtns="rightIconBtnsArray">
     * </entityShowcase>
     */
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