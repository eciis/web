(function () {
    'use strict';

    /**
     * Component that shows an entity (user or institution). It receives a title (entity name),
     * a subtitle (an entity information) and an avatar (the image to be shown). Also, it can
     * receive an icon in case the entity doesn't have an avatar url. It can receive a left
     * action that will be triggered when the user clicks on the avatar or the icon and an array
     * of rightIconBtns objects that has an icon, an icon-color and an action. You shouldn't use
     * both icon and avatar at the same time.
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