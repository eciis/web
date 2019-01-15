(function () {
    'use strict';

    angular.module("webchat").component("userDescription", {
        templateUrl: "app/components/user-description/user-description.html",
        controller: userDescriptionController,
        controllerAs: "userDescriptionCtrl",
        bindings: {
            className: "@",
            style: "@",
            ariaLabel: "@",
            name: "@",
            description: "@",
            avatar: "@",
            onClick: "&",
        },
    });

    function userDescriptionController() {
        const userDescriptionCtrl = this;

        userDescriptionCtrl.charLimitName = Utils.isMobileScreen() ? 15 : 25;
        userDescriptionCtrl.charLimitDescription = Utils.isMobileScreen() ? 20 : 35;
        userDescriptionCtrl.limitString = (string, charLimit) => Utils.limitString(string, charLimit);

    }

})();