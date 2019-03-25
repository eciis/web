(function () {
    'use strict';

    /**
     * User object showcase. It receives a name, a description and an avatar.
     * It limits the name and the avatar according to the device that is being
     * used.
     * @class userDescription
     * @example
     * <userDescription name="userName" description="userDescription" avatar="userAvatar"></userDescription>
     */
    angular.module("webchat").component("userDescription", {
        templateUrl: "app/components/user-description/user-description.html",
        controller: userDescriptionController,
        controllerAs: "userDescriptionCtrl",
        bindings: {
            name: "@",
            text: "@",
            avatar: "@",
        },
    });

    function userDescriptionController() {
        const userDescriptionCtrl = this;

    }

})();